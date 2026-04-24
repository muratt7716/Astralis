# Mistik Rehber — Companion OS Design Spec
**Date:** 2026-04-25
**Status:** Approved
**Scope:** Mistik Rehber chat system — 4-phase upgrade

---

## Problem

The current Mistik Rehber chat system has four compounding issues that limit user experience and long-term retention:

1. **Dead air UX** — Users wait 4-6 seconds staring at a blank screen before the full response appears.
2. **Fragile JSON output** — `parseGeminiJson()` fails when Gemini adds markdown wrappers, trailing commas, or leaks plain text outside the JSON block. Users see empty messages.
3. **Flat memory retrieval** — Top 20 memories by importance score are always loaded, regardless of conversation topic. After months of use, the wrong memories surface.
4. **Static prompts** — Guide characters feel consistent but don't organically adapt tone to the individual user over time.

---

## Goals

- Make the app feel alive: guides "type" in real time
- Make JSON output structurally guaranteed — no more parse failures
- Make memory retrieval topic-aware — the right memory at the right moment
- Make guide tone subtly adapt to each user's communication style over time
- Improve prompt quality so guides feel more human and less robotic

---

## Non-Goals

- Voice chat (future phase, noted — not in this spec)
- LLM intent routing (dropped — current fallback chain is sufficient)
- Replacing the Supabase stack

---

## Architecture Overview

```
User message
    │
    ▼
[Parallel DB fetch — Promise.all]
  profile + premium check + conversation +
  warmth days + memories + chat history + interaction logs
    │
    ▼
[Semantic Memory Query — pgvector]
  Find top 5 memories most similar to current message
  Fallback: importance-ordered limit(20) if no embeddings yet
    │
    ▼
[Build system prompt — improved quality]
    │
    ▼
[Gemini — Structured Output Schema]
  responseMimeType: "application/json"
  responseSchema: enforced at API level
    │
    ▼
[SSE Stream → client]
  Words appear as they generate
    │
    ▼
[Background: save message + memories + decay update]
```

---

## Phase 1 — Streaming + Parallel DB + Structured Outputs (~1 week)

### 1A. Streaming (SSE)

**Route change:** Convert `POST /api/mistik-rehber/chat` to return a `ReadableStream` with `Content-Type: text/event-stream`.

Gemini's `generateContentStream()` yields chunks. Each chunk is written to the stream as:
```
data: {"delta": "Merhaba"}\n\n
data: {"delta": ", nasılsın"}\n\n
data: [DONE]\n\n
```

The final `[DONE]` event carries the complete parsed object (visual slug, memories_to_save) so the client can handle side effects after streaming ends.

**Frontend:** The chat component switches from `await fetch(...)` to consuming a `ReadableStream`. A `useRef` accumulates the streaming text into the message bubble in real time.

**Fallback:** If streaming fails (network error mid-stream), client retries as a standard POST for the full response.

### 1B. Parallel DB Queries

All independent Supabase queries are wrapped in a single `Promise.all()`:

```
[profile, convRows, memories, recentMessages, interactionLogs]
  = await Promise.all([...])
```

Premium check and warmth calculation happen synchronously after the parallel fetch using the already-loaded data. Expected latency reduction: ~40%.

### 1C. Structured Outputs

`callGeminiWithFallback` gains a new optional `schema` parameter. When provided, the API call includes:

```js
config: {
  responseMimeType: "application/json",
  responseSchema: { ... }
}
```

The chat route passes the full response schema (message, visual, memories_to_save). `parseGeminiJson()` becomes a thin safety wrapper — the schema guarantee means it almost never needs to do real work.

**Schema definition:**
```json
{
  "type": "object",
  "properties": {
    "message": { "type": "string" },
    "visual": { "type": "string", "nullable": true },
    "memories_to_save": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "category": { "type": "string" },
          "fact": { "type": "string" },
          "importance": { "type": "integer", "minimum": 1, "maximum": 5 }
        },
        "required": ["category", "fact", "importance"]
      }
    }
  },
  "required": ["message", "memories_to_save"]
}
```

---

## Phase 2 — Prompt Quality Improvements (~1 week)

### Problems with current prompts

- Characters occasionally slip into "robot guru" mode — every message has a lesson
- Memory injection is a flat list, not contextually framed
- The adaptive engine section is too long and verbose — Gemini tends to follow only the last instruction in a long block
- `buildSummaryPrompt` returns raw JSON, not used to seed the next conversation meaningfully

### Improvements

**Shorter, sharper adaptive engine:** Condense STATE DETECTION to a 6-row table. LLMs follow tables better than numbered paragraphs for classification tasks.

**Memory injection rewrite:** Instead of listing facts as bullets, frame them as the guide's internal monologue:
```
// Current
- Annesiyle ilişkisi zor (aile, Önem: 4/5)

// New
[Aklının bir köşesinde: Bu kişinin annesiyle mesafeli olduğunu biliyorsun. Yeri geldikçe, dayatmadan, bir arkadaş gibi hatırlat.]
```

**Per-character prompt tightening:** Each character gets a `DO_NOT` block — the single most common failure mode for that character:
- Melisa: "Anaç hitapları her mesajda kullanma"
- Aras: "Her sohbette estetik analiz yapma"
- Umut: "Kısa cevap imzanı uzun felsefeyle bozma"
- Hekate: "Her cümleni kitabe gibi kurma"
- Selin: "Aynı jargon kelimelerini (frekans, kuantum) arka arkaya tekrarlama"

**Context summary usage:** The `context_summary` is currently injected as raw JSON. It will be formatted as a brief narrative paragraph so Gemini reads it as natural context, not data.

---

## Phase 3 — Semantic Memory + Decay (~2 weeks)

### Database Migration

Enable pgvector in Supabase:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE memories ADD COLUMN embedding vector(768);
CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);
```

### Embedding Generation

When a memory is saved, a background call generates its embedding using Gemini's `text-embedding-004` model (768 dimensions, available via the same Vertex AI credentials). The embedding is stored alongside the fact.

**Fallback:** If embedding generation fails, memory is saved without embedding and falls back to importance-ordered retrieval.

### Semantic Retrieval

At query time, the user's current message is embedded and a similarity search retrieves the top 5 most relevant memories:

```sql
SELECT category, fact, importance
FROM memories
WHERE user_id = $1 AND guide_id = $2
ORDER BY embedding <=> $3
LIMIT 5;
```

The top 5 semantic memories are merged with top 3 importance-based memories (deduplicated), giving the guide both topic-relevant and globally-important context.

### Memory Decay

A weekly background job (Supabase Edge Function or cron) runs:
- Memories not referenced in 30 days: importance -= 0.5 (floor: 1)
- Memories referenced in last 7 days: importance += 0.2 (ceiling: 5)
- `last_referenced_at` is updated each time a memory appears in a prompt

---

## Phase 4 — Conversation Graph + Persona Drift (~2 weeks)

### Conversation Graph

New table `conversation_topics`:
```sql
CREATE TABLE conversation_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  guide_id text,
  topic text,
  message_count integer DEFAULT 1,
  last_seen_at timestamptz DEFAULT now()
);
```

Topics are extracted from the summary generation step (already running every 20 messages). Over time this builds a map of what each user talks about most with each guide.

### Persona Drift

Each guide character gains a `drift_profile` stored in `conversations.metadata`:
```json
{
  "tone_depth": 0.6,
  "humor_frequency": 0.3,
  "challenge_level": 0.4
}
```

These values shift ±0.05 per conversation based on user engagement signals (message length, response latency, conversation continuation). They are injected into the system prompt as a one-line modifier:

```
Ton Kalibrasyonu: Bu kullanıcıyla derin konuşmalar yoğun, hafif bir ağırlık ekle. Mizah dozunu düşür.
```

The character's core identity (IDENTITY_MATRIX, NARRATIVE_BIBLE, CORE_SECRET) never changes. Only surface tone adapts.

---

## Future: Voice Chat

Noted for a future spec. Likely approach: browser Web Speech API for STT, Gemini/ElevenLabs for TTS, streaming audio chunks over WebSocket. Will be designed separately.

---

## Risk & Rollback

| Phase | Risk | Rollback |
|-------|------|----------|
| Faz 1 — Streaming | Client streaming support issues | Feature flag: `?stream=false` falls back to standard POST |
| Faz 1 — Structured Output | Schema too strict, Gemini rejects | Remove schema, revert to parseGeminiJson |
| Faz 3 — pgvector | Embedding generation latency | Skip embedding if >500ms, use importance fallback |
| Faz 4 — Persona Drift | Drift values corrupt character | Clamp values 0-1, reset to defaults if out of range |

Each phase is independently deployable and independently reversible.
