# Companion OS — Faz 3: Semantic Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehberlerin hafıza erişimini düz önem sıralamasından vektör benzerliğine taşı — kullanıcı ne konuşuyorsa o konuya en yakın anılar öne çıksın.

**Architecture:** `src/lib/embeddings.ts` dosyası Gemini `text-embedding-004` modeliyle 768-boyutlu embedding üretir ve Supabase pgvector'de saklı anılar arasında kosinüs benzerliği araması yapar. Chat route'u kullanıcı mesajını embed edip top-5 semantik + top-3 önem tabanlı anıyı birleştirerek servise verir. Fallback: embedding yoksa eski limit(20) mantığı devreye girer. Memory decay ise `/api/mistik-rehber/memory-decay` endpointinden Vercel Cron ile tetiklenir.

**Tech Stack:** `@google/genai` v1.47.0 (text-embedding-004 via Vertex AI), Supabase pgvector (vector(768), ivfflat index, custom RPC), Next.js API route (cron endpoint)

---

## ⚠️ Ön Koşul: Supabase Manuel Migration (Kod Yazmadan Önce)

Bu adım Supabase Dashboard → SQL Editor'da elle çalıştırılmalıdır. Kod tarafı bu olmadan çalışmaz.

```sql
-- 1. pgvector eklentisini etkinleştir
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. memories tablosuna embedding kolonu ekle (nullable — eski kayıtlar etkilenmez)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. importance kolonunu float'a çevir (decay için ondalıklı değer gerekli)
ALTER TABLE memories ALTER COLUMN importance TYPE float4;

-- 4. Kosinüs benzerliği için IVFFlat indeksi
CREATE INDEX IF NOT EXISTS memories_embedding_idx
  ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Semantic arama RPC fonksiyonu
CREATE OR REPLACE FUNCTION search_memories_by_embedding(
  p_user_id uuid,
  p_guide_id text,
  p_embedding vector(768),
  p_limit int DEFAULT 5
)
RETURNS TABLE(category text, fact text, importance float4)
LANGUAGE sql
STABLE
AS $$
  SELECT category, fact, importance
  FROM memories
  WHERE user_id = p_user_id
    AND guide_id = p_guide_id
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;
```

---

## File Map

| File | Değişiklik |
|------|-----------|
| `src/lib/embeddings.ts` | Yeni — embedding üretimi + semantic arama |
| `src/app/api/mistik-rehber/chat/route.ts` | Modify — semantic retrieval entegrasyonu + last_referenced_at güncelleme |
| `src/app/api/mistik-rehber/memory-decay/route.ts` | Yeni — decay cron endpoint |

---

## Task 1: `embeddings.ts` — Embedding üretimi ve semantic arama

**Files:**
- Create: `src/lib/embeddings.ts`

- [ ] **Step 1: Dosyayı oluştur**

  `src/lib/embeddings.ts` oluştur ve aşağıdaki içeriği yaz:

  ```typescript
  // src/lib/embeddings.ts
  import { GoogleGenAI } from "@google/genai";
  import { supabaseAdmin } from "@/lib/supabase-admin";

  let credentials: any = {};
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
  } catch {}

  const ai = new GoogleGenAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
    vertexai: true,
    googleAuthOptions: { credentials },
  });

  /**
   * Verilen metni 768-boyutlu vektöre çevirir.
   * Hata durumunda null döner — caller fallback mantığı uygular.
   */
  export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
      // 450ms timeout: yavaş embedding yerine importance fallback tercih edilir
      const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 450));
      const embed = ai.models.embedContent({
        model: "text-embedding-004",
        contents: [{ role: "user", parts: [{ text }] }],
      }).then(response => {
        const values = (response as any).embeddings?.[0]?.values ?? null;
        return Array.isArray(values) ? (values as number[]) : null;
      });
      return await Promise.race([embed, timeout]);
    } catch (err) {
      console.warn("[Embeddings] Failed to generate embedding:", err);
      return null;
    }
  }

  /**
   * Kullanıcı mesajına semantik olarak en yakın anıları getirir.
   * pgvector IVFFlat kosinüs benzerliği kullanır.
   * Fallback: embedding yoksa veya RPC başarısız olursa boş dizi döner.
   */
  export async function searchMemoriesByEmbedding(
    userId: string,
    guideId: string,
    queryEmbedding: number[],
    limit = 5
  ): Promise<Array<{ category: string; fact: string; importance: number }>> {
    try {
      const { data, error } = await supabaseAdmin.rpc("search_memories_by_embedding", {
        p_user_id: userId,
        p_guide_id: guideId,
        p_embedding: queryEmbedding,
        p_limit: limit,
      });
      if (error) {
        console.warn("[Embeddings] RPC search failed:", error.message);
        return [];
      }
      return (data || []) as Array<{ category: string; fact: string; importance: number }>;
    } catch (err) {
      console.warn("[Embeddings] searchMemoriesByEmbedding error:", err);
      return [];
    }
  }

  /**
   * Anı kaydedildikten sonra arka planda embedding üretir ve günceller.
   * Await etme — caller'ı bloklamaz.
   */
  export async function saveMemoryEmbeddingBackground(
    userId: string,
    guideId: string,
    fact: string
  ): Promise<void> {
    const embedding = await generateEmbedding(fact);
    if (!embedding) return;

    await supabaseAdmin
      .from("memories")
      .update({ embedding })
      .eq("user_id", userId)
      .eq("guide_id", guideId)
      .eq("fact", fact);
  }
  ```

- [ ] **Step 2: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

  Beklenen: Temiz. Eğer `(response as any)` cast'ı yerine doğrudan tip çalışıyorsa cast'ı kaldır.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/embeddings.ts
  git commit -m "feat(embeddings): add semantic embedding generation and pgvector search"
  ```

---

## Task 2: `chat/route.ts` — Semantic retrieval + last_referenced_at

**Files:**
- Modify: `src/app/api/mistik-rehber/chat/route.ts`

Şu an route, `memoriesResult.data` (importance sıralamalı limit-20) kullanıyor. Bunu semantic + importance hybrid'e çeviriyoruz. Ayrıca kullanılan anıların `last_referenced_at` değeri güncelleniyor.

- [ ] **Step 1: Import satırına embeddings fonksiyonlarını ekle**

  Dosyanın başındaki import'ları bul ve `callGeminiWithFallback, callGeminiStream` satırının altına ekle:

  ```typescript
  import { generateEmbedding, searchMemoriesByEmbedding, saveMemoryEmbeddingBackground } from "@/lib/embeddings";
  ```

- [ ] **Step 2: `const memories = memoriesResult.data || [];` satırını değiştir**

  Şu anki `const memories = memoriesResult.data || [];` satırını bulup şununla değiştir:

  ```typescript
  // Semantic retrieval: kullanıcı mesajını embed et, benzer anıları bul
  let memories: Array<{ category: string; fact: string; importance: number }> = [];
  const fallbackMemories = (memoriesResult.data || []) as typeof memories;

  const queryEmbedding = await generateEmbedding(message);
  if (queryEmbedding) {
    const semanticHits = await searchMemoriesByEmbedding(userId, guideId, queryEmbedding, 5);
    const importanceTop = fallbackMemories.slice(0, 3);

    // Semantik + önem tabanlı sonuçları birleştir, tekrarları çıkar
    const seen = new Set<string>();
    for (const m of [...semanticHits, ...importanceTop]) {
      if (!seen.has(m.fact)) {
        seen.add(m.fact);
        memories.push(m);
      }
    }
  } else {
    // Fallback: embedding başarısız oldu, eski davranış
    memories = fallbackMemories;
  }

  // Kullanılan anıların last_referenced_at değerini arka planda güncelle
  if (memories.length > 0) {
    const facts = memories.map(m => m.fact);
    supabaseAdmin
      .from("memories")
      .update({ last_referenced_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("guide_id", guideId)
      .in("fact", facts)
      .then(() => {})
      .catch(e => console.warn("[Memories] last_referenced_at update failed:", e));
  }
  ```

- [ ] **Step 3: Anı kaydedilirken embedding üretimini tetikle**

  Chat route'da anılar kaydedilen bölümü bul. Şu anki kod:
  ```typescript
  await Promise.all(
    parsed.memories_to_save.map(mem =>
      supabaseAdmin.from("memories").upsert(...)
    )
  );
  ```
  Bu bloğun hemen ALTINA ekle:

  ```typescript
  // Yeni anılar için embedding üretimi arka planda çalışır — stream'i bloklamaz
  for (const mem of parsed.memories_to_save) {
    saveMemoryEmbeddingBackground(userId, guideId, mem.fact).catch(() => {});
  }
  ```

- [ ] **Step 4: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/api/mistik-rehber/chat/route.ts
  git commit -m "feat(chat-route): integrate semantic memory retrieval with pgvector fallback"
  ```

---

## Task 3: Memory Decay — Cron endpoint

**Files:**
- Create: `src/app/api/mistik-rehber/memory-decay/route.ts`

Bu endpoint Vercel Cron veya harici scheduler tarafından haftada 1 çağrılır. `CRON_SECRET` env var ile korunur.

- [ ] **Step 1: Route dosyasını oluştur**

  `src/app/api/mistik-rehber/memory-decay/route.ts` oluştur:

  ```typescript
  // src/app/api/mistik-rehber/memory-decay/route.ts
  import { NextRequest } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase-admin";

  export const runtime = "nodejs";

  export async function POST(req: NextRequest) {
    // Basit secret kontrolü — CRON_SECRET env var yoksa devre dışı bırakma
    const secret = req.headers.get("x-cron-secret");
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // 30 gündür referans verilmeyen anıların önemi düşer (taban: 1)
      const { count: decayed } = await supabaseAdmin
        .from("memories")
        .select("id", { count: "exact", head: true })
        .lt("last_referenced_at", thirtyDaysAgo)
        .gt("importance", 1);

      await supabaseAdmin.rpc("decay_old_memories", {
        p_threshold_date: thirtyDaysAgo,
        p_boost_date: sevenDaysAgo,
      });

      return new Response(
        JSON.stringify({ success: true, processed: decayed ?? 0, runAt: now.toISOString() }),
        { status: 200 }
      );
    } catch (err: any) {
      console.error("[MemoryDecay] Error:", err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Supabase'de decay RPC fonksiyonunu oluştur**

  Supabase Dashboard → SQL Editor'da çalıştır:

  ```sql
  CREATE OR REPLACE FUNCTION decay_old_memories(
    p_threshold_date timestamptz,
    p_boost_date timestamptz
  )
  RETURNS void
  LANGUAGE sql
  AS $$
    -- 30 günden eski: önem -0.5 (taban 1)
    UPDATE memories
    SET importance = GREATEST(1, importance - 0.5)
    WHERE last_referenced_at < p_threshold_date;

    -- Son 7 gün içinde referans verilen: önem +0.2 (tavan 5)
    UPDATE memories
    SET importance = LEAST(5, importance + 0.2)
    WHERE last_referenced_at > p_boost_date;
  $$;
  ```

- [ ] **Step 3: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/api/mistik-rehber/memory-decay/route.ts
  git commit -m "feat(memory-decay): add weekly decay cron endpoint with importance floor/ceiling"
  ```

---

## Task 4: Son doğrulama

- [ ] **Step 1: Production build**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npm run build 2>&1 | tail -15
  ```

  Beklenen: Build başarılı.

- [ ] **Step 2: Embedding API şemasını doğrula**

  Dev server'da bir mesaj gönder ve console'da `[Embeddings]` warn'larını izle. Eğer `embeddings?.[0]?.values` undefined dönüyorsa, `generateEmbedding` fonksiyonunda şu alternatif shape'i dene:

  ```typescript
  // Alternatif 1
  const values = (response as any).embedding?.values ?? null;

  // Alternatif 2
  const values = (response as any).embeddings?.[0]?.values ?? null;
  ```

  Console'da embedding boyutunu logla:
  ```typescript
  console.log("[Embeddings] Dimension:", values?.length); // 768 olmalı
  ```

- [ ] **Step 3: End-to-end akış testi**

  Test senaryosu:
  1. Bir rehberle "annem hakkında endişeleniyorum" de — anı kaydedilmeli
  2. Yeni bir sohbet başlat, "aile konusunda ne düşünüyorsun?" de
  3. Route loglarında `semanticHits` array'i dolu olmalı (anı geri geldi)
  4. `last_referenced_at` DB'de güncellendi mi? Supabase'de kontrol et

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: Faz3 complete — pgvector semantic memory, decay endpoint"
  ```

---

## Sonraki Plan

Faz 4: `docs/superpowers/plans/2026-04-25-companion-os-faz4-persona-drift.md`
