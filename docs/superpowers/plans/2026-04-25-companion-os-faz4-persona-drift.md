# Companion OS — Faz 4: Persona Drift & Conversation Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehber karakterlerin tonu her kullanıcıyla geçirilen konuşmaların doğasına göre mikro-uyum sağlasın; hangi konuların konuşulduğu grafik olarak izlensin.

**Architecture:** `src/lib/persona-drift.ts` katmanı sohbet sinyallerinden (mesaj uzunluğu, konuşma derinliği) `DriftProfile` değerlerini hesaplayıp günceller. `drift_profile` JSONB olarak `conversations` tablosunda saklanır; `buildSystemPrompt`'a bir satırlık "Ton Kalibrasyonu" direktifi olarak enjekte edilir. Her 20 mesajda çalışan özet fonksiyonu aynı zamanda `conversation_topics` tablosunu günceller — kimin hangi rehberle ne hakkında konuştuğunun haritası çıkar.

**Tech Stack:** Supabase JSONB (`conversations.drift_profile`, `conversation_topics` table), Next.js API route, TypeScript

---

## ⚠️ Ön Koşul: Supabase Manuel Migration

Supabase Dashboard → SQL Editor'da çalıştır:

```sql
-- 1. conversations tablosuna drift_profile kolonu ekle
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS drift_profile jsonb
  DEFAULT '{"tone_depth": 0.5, "humor_frequency": 0.5, "challenge_level": 0.3}'::jsonb;

-- 2. conversation_topics tablosu
CREATE TABLE IF NOT EXISTS conversation_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  guide_id text NOT NULL,
  topic text NOT NULL,
  message_count integer NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, guide_id, topic)
);

CREATE INDEX IF NOT EXISTS conversation_topics_user_guide_idx
  ON conversation_topics (user_id, guide_id);

-- 3. Topic upsert için RPC (count increment)
CREATE OR REPLACE FUNCTION upsert_conversation_topic(
  p_user_id uuid,
  p_guide_id text,
  p_topic text
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO conversation_topics (user_id, guide_id, topic, message_count, last_seen_at)
  VALUES (p_user_id, p_guide_id, p_topic, 1, now())
  ON CONFLICT (user_id, guide_id, topic)
  DO UPDATE SET
    message_count = conversation_topics.message_count + 1,
    last_seen_at = now();
$$;
```

---

## File Map

| File | Değişiklik |
|------|-----------|
| `src/lib/persona-drift.ts` | Yeni — drift hesaplama ve prompt enjeksiyonu |
| `src/lib/guide-prompts.ts` | Modify — drift direktifi parametresi |
| `src/app/api/mistik-rehber/chat/route.ts` | Modify — drift okuma/yazma + topic extraction |

---

## Task 1: `persona-drift.ts` — Drift hesaplama katmanı

**Files:**
- Create: `src/lib/persona-drift.ts`

- [ ] **Step 1: Dosyayı oluştur**

  ```typescript
  // src/lib/persona-drift.ts

  export interface DriftProfile {
    tone_depth: number;       // 0-1: 0=hafif, 1=derin
    humor_frequency: number;  // 0-1: 0=ciddi, 1=mizahi
    challenge_level: number;  // 0-1: 0=onaylayıcı, 1=meydan okuyucu
  }

  export const DEFAULT_DRIFT: DriftProfile = {
    tone_depth: 0.5,
    humor_frequency: 0.5,
    challenge_level: 0.3,
  };

  const DELTA = 0.05;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  /**
   * Sohbet sinyallerine göre drift değerlerini günceller.
   * Her sohbet sonunda bir kez çağrılır.
   */
  export function updateDriftProfile(
    current: DriftProfile,
    signals: {
      avgUserMessageLength: number;
      messageCount: number;
    }
  ): DriftProfile {
    const isDeep = signals.avgUserMessageLength > 80;
    const isActive = signals.messageCount >= 4;

    return {
      tone_depth: clamp(current.tone_depth + (isDeep ? DELTA : -DELTA * 0.5)),
      humor_frequency: clamp(current.humor_frequency + (isDeep ? -DELTA * 0.3 : DELTA * 0.3)),
      challenge_level: clamp(current.challenge_level + (isActive ? DELTA * 0.4 : 0)),
    };
  }

  /**
   * Sohbet geçmişinden sinyal değerlerini hesaplar.
   */
  export function extractSignals(
    chatHistory: Array<{ role: string; content: string }>
  ): { avgUserMessageLength: number; messageCount: number } {
    const userMessages = chatHistory.filter(m => m.role === "user");
    const total = userMessages.reduce((sum, m) => sum + m.content.length, 0);
    return {
      avgUserMessageLength: userMessages.length > 0 ? total / userMessages.length : 0,
      messageCount: userMessages.length,
    };
  }

  /**
   * DriftProfile'dan sistem prompt'a enjekte edilecek tek satırlık direktif üretir.
   * Karakter özü değişmez — sadece ton ince ayarı yapılır.
   */
  export function buildDriftDirective(drift: DriftProfile): string {
    const parts: string[] = [];

    if (drift.tone_depth > 0.65) {
      parts.push("Bu kullanıcıyla derin konuşmalar ağır bastı — biraz daha ağırlıklı ol.");
    } else if (drift.tone_depth < 0.35) {
      parts.push("Bu kullanıcıyla çoğunlukla hafif sohbetler geçti — hafif kal.");
    }

    if (drift.humor_frequency > 0.65) {
      parts.push("Mizah dozunu yüksek tut.");
    } else if (drift.humor_frequency < 0.35) {
      parts.push("Mizah dozunu kıs.");
    }

    if (drift.challenge_level > 0.55) {
      parts.push("Bu kullanıcı meydan okumayı seviyor — gerektiğinde cesaretlendirici bir baskı uygula.");
    }

    if (parts.length === 0) return "";
    return `Ton Kalibrasyonu (sadece bu kullanıcıya özel): ${parts.join(" ")}`;
  }

  /**
   * Veritabanından gelen raw değeri DriftProfile'a güvenli çevirir.
   */
  export function parseDriftProfile(raw: any): DriftProfile {
    if (!raw || typeof raw !== "object") return { ...DEFAULT_DRIFT };
    return {
      tone_depth: typeof raw.tone_depth === "number" ? clamp(raw.tone_depth) : DEFAULT_DRIFT.tone_depth,
      humor_frequency: typeof raw.humor_frequency === "number" ? clamp(raw.humor_frequency) : DEFAULT_DRIFT.humor_frequency,
      challenge_level: typeof raw.challenge_level === "number" ? clamp(raw.challenge_level) : DEFAULT_DRIFT.challenge_level,
    };
  }
  ```

- [ ] **Step 2: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/persona-drift.ts
  git commit -m "feat(persona-drift): add drift profile calculation and directive builder"
  ```

---

## Task 2: `guide-prompts.ts` — Drift direktifi enjeksiyonu

**Files:**
- Modify: `src/lib/guide-prompts.ts`

`SystemPromptParams` arayüzüne `driftDirective?: string` alanı ekle ve return bloğuna enjekte et.

- [ ] **Step 1: `SystemPromptParams` arayüzüne alan ekle**

  `src/lib/guide-prompts.ts` dosyasında `SystemPromptParams` interface'ini bul:

  ```typescript
  export interface SystemPromptParams {
    guideId: string;
    warmthLevel: WarmthLevel;
    language: string;
    profile: { ... };
    memories: Memory[];
    interactionLogs?: Array<...>;
    contextSummary?: string | null;
  }
  ```

  `contextSummary` satırından sonrasına ekle:

  ```typescript
  driftDirective?: string;
  ```

- [ ] **Step 2: `buildSystemPrompt` fonksiyonunda direktifi destructure et**

  `buildSystemPrompt` fonksiyonunun başındaki destructure satırını bul:
  ```typescript
  const { guideId, warmthLevel, language, profile, memories, contextSummary, interactionLogs } = params;
  ```
  Şununla değiştir:
  ```typescript
  const { guideId, warmthLevel, language, profile, memories, contextSummary, interactionLogs, driftDirective } = params;
  ```

- [ ] **Step 3: Return bloğuna drift direktifini ekle**

  Return bloğundaki array'i bul. `\n## SAMİMİYET SEVİYESİ` satırından önce şunu ekle:

  ```typescript
  driftDirective ? `\n## TON KALİBRASYONU\n${driftDirective}` : "",
  ```

  Yani return array'i şöyle olacak:
  ```typescript
  return [
    `# 1. KARAKTER KİMLİĞİ VE PERSPEKTİF\n${characterPrompt}`,
    userDataContext,
    memoriesSection,
    `\n## GEÇMİŞ SOHBET BAĞLAMI\n${...}`,
    driftDirective ? `\n## TON KALİBRASYONU\n${driftDirective}` : "",
    `\n## SAMİMİYET SEVİYESİ (${warmthLevel})\n${warmthPrompt}`,
    adaptiveEngine,
    dynamicConstraints,
    memoryRules,
    polyglotAndVisual,
    outputRule,
  ].filter(Boolean).join("\n\n");
  ```

- [ ] **Step 4: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/guide-prompts.ts
  git commit -m "feat(prompts): inject persona drift directive into system prompt"
  ```

---

## Task 3: `chat/route.ts` — Drift okuma, yazma, topic extraction

**Files:**
- Modify: `src/app/api/mistik-rehber/chat/route.ts`

3 değişiklik:
1. Conversation yüklenirken `drift_profile` da çekiliyor
2. Stream sonunda sinyal hesaplanıp drift güncelleniyor
3. Özet üretildiğinde topics `conversation_topics` tablosuna yazılıyor

- [ ] **Step 1: Import ekle**

  Dosyanın başına şu import'u ekle:

  ```typescript
  import { parseDriftProfile, updateDriftProfile, extractSignals, buildDriftDirective } from "@/lib/persona-drift";
  ```

- [ ] **Step 2: Conversation yükleme bloğunda `drift_profile` çek**

  `context_summary` seçen bloğu bul:
  ```typescript
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("context_summary")
    .eq("id", activeConversationId)
    .single();
  contextSummary = conv?.context_summary || null;
  ```
  Şununla değiştir:
  ```typescript
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("context_summary, drift_profile")
    .eq("id", activeConversationId)
    .single();
  contextSummary = conv?.context_summary || null;
  const driftProfile = parseDriftProfile(conv?.drift_profile);
  ```

  Ayrıca yeni conversation oluşturulan branch'te de default drift ekle:
  ```typescript
  if (!activeConversationId) {
    const { data: newConv } = await supabaseAdmin
      .from("conversations")
      .insert({ user_id: userId, guide_id: guideId })
      .select("id")
      .single();
    activeConversationId = newConv?.id;
  }
  // Yeni conversation için default drift
  const driftProfile = parseDriftProfile(null);
  ```

  > Not: `driftProfile` değişkenini her iki branch'te de declare etmek için `let driftProfile` kullanabilirsin:
  ```typescript
  let driftProfile = parseDriftProfile(null);

  if (!activeConversationId) {
    const { data: newConv } = await supabaseAdmin
      .from("conversations")
      .insert({ user_id: userId, guide_id: guideId })
      .select("id")
      .single();
    activeConversationId = newConv?.id;
  } else {
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("context_summary, drift_profile")
      .eq("id", activeConversationId)
      .single();
    contextSummary = conv?.context_summary || null;
    driftProfile = parseDriftProfile(conv?.drift_profile);
  }
  ```

- [ ] **Step 3: `buildSystemPrompt` çağrısına drift direktifi ekle**

  `buildSystemPrompt({...})` çağrısını bul ve `driftDirective` parametresini ekle:

  ```typescript
  const systemPrompt = buildSystemPrompt({
    guideId,
    warmthLevel,
    language: language || "tr",
    profile: {
      ...profile,
      birth_chart_summary: (profile as any).birth_chart_summary ?? null,
    },
    memories: memories || [],
    interactionLogs: interactionLogs || [],
    contextSummary,
    driftDirective: buildDriftDirective(driftProfile),  // YENİ
  });
  ```

- [ ] **Step 4: Stream sonunda drift güncelle ve topics yaz**

  Chat route'da `// Her 20 mesajda özet güncelle` bloğunu bul. Bu bloğun içindeki `try` bloğuna, `summaryJson` parse edildikten SONRA şunu ekle:

  ```typescript
  // Topics tablosunu güncelle
  for (const topic of (summaryJson.topics || []) as string[]) {
    supabaseAdmin.rpc("upsert_conversation_topic", {
      p_user_id: userId,
      p_guide_id: guideId,
      p_topic: topic,
    }).then(() => {}).catch(e => console.warn("[Topics] upsert failed:", e));
  }
  ```

  Ayrıca `controller.close()` satırından HEMEN ÖNCE drift güncelleme ekle:

  ```typescript
  // Drift profile güncelle (arka planda — stream'i bloklamaz)
  const signals = extractSignals(chatHistory);
  const updatedDrift = updateDriftProfile(driftProfile, signals);
  supabaseAdmin
    .from("conversations")
    .update({ drift_profile: updatedDrift })
    .eq("id", activeConversationId)
    .then(() => {})
    .catch(e => console.warn("[Drift] update failed:", e));
  ```

- [ ] **Step 5: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/api/mistik-rehber/chat/route.ts
  git commit -m "feat(chat-route): read/write drift_profile and extract conversation topics"
  ```

---

## Task 4: Son doğrulama

- [ ] **Step 1: Production build**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npm run build 2>&1 | tail -15
  ```

- [ ] **Step 2: Drift akış testi**

  1. Bir rehberle 5+ uzun mesaj yaz (her biri 80+ karakter)
  2. Supabase'de `conversations` tablosunda `drift_profile` kolonunu kontrol et — `tone_depth` artmış olmalı
  3. Mesaj gönderince sistem prompt'ta `TON KALİBRASYONU` bölümü çıkıyor mu? (Route log'larına `console.log(systemPrompt.slice(0, 500))` ekleyerek test edebilirsin)

- [ ] **Step 3: Topic extraction testi**

  1. 20 mesaj sonra özet otomatik tetiklenir
  2. Supabase'de `conversation_topics` tablosunda kayıtlar görünmeli
  3. Hızlı test için özet tetikleme: route'da `msgCount % 20 === 0` yerine geçici olarak `msgCount % 2 === 0` yap, 2 mesaj gönder, tabloyu kontrol et, sonra geri al

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: Faz4 complete — persona drift, conversation topics graph"
  ```
