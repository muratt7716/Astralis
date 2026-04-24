# Companion OS — Faz 1 + Faz 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehber yanıtları gerçek zamanlı kelime kelime stream edilsin, DB sorguları paralel çalışsın, JSON çıktısı API seviyesinde kilitlensin ve karakter promptları daha doğal hissettirsin.

**Architecture:** `callGeminiStream()` raw JSON token'larını SSE olarak client'a pipe eder; client basit bir regex ile `"message"` alanını parse ederek typing animasyonu yerine gerçek metin gösterir. DB sorguları `Promise.all` ile paralel çalışır. Prompt'lar tablo + iç monolog formatına geçer.

**Tech Stack:** `@google/genai` v1.47.0 (Vertex AI), Next.js App Router SSE (`ReadableStream`), React `useRef` streaming accumulator, TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/lib/gemini.ts` | `callGeminiWithFallback` schema parametresi + yeni `callGeminiStream()` |
| `src/app/api/mistik-rehber/chat/route.ts` | Parallel DB + SSE streaming response |
| `src/app/mistik-rehber/chat/[guideId]/page.tsx` | SSE stream consumer, live text render |
| `src/lib/guide-prompts.ts` | Prompt kalite iyileştirmeleri (Faz 2) |

---

## Task 1: `gemini.ts` — Schema desteği ve stream fonksiyonu

**Files:**
- Modify: `src/lib/gemini.ts`

Bu task'ta `callGeminiWithFallback`'e opsiyonel schema parametresi ekleniyor ve streaming için yeni `callGeminiStream` fonksiyonu yazılıyor.

- [ ] **Step 1: Mevcut dosyayı tam oku**

  `src/lib/gemini.ts` dosyasını oku — şu an 59 satır.

- [ ] **Step 2: Dosyayı aşağıdaki içerikle güncelle**

  ```typescript
  // src/lib/gemini.ts
  import { GoogleGenAI, Type } from "@google/genai";
  import { calculateBaseCompatibilityScore } from "./astrology/compatibility-logic";

  let credentials: any = {};
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
  } catch (error) {
    console.error("Google Service Account JSON ayrıştırma hatası:", error);
  }

  const ai = new GoogleGenAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
    vertexai: true,
    googleAuthOptions: { credentials },
  });

  export type SupportedLanguage = "tr" | "en" | "ar" | "de" | "fr";

  const languageNames: Record<SupportedLanguage, string> = {
    tr: "Türkçe",
    en: "English",
    ar: "العربية",
    de: "Deutsch",
    fr: "Français",
  };

  // JSON schema type — schema nesnesi olduğu sürece @google/genai bunu kabul eder
  export type GeminiSchema = Record<string, any>;

  /**
   * Companion chat yanıtı için zorunlu JSON şeması.
   * Structured Output ile API seviyesinde kilitleniyor — parseGeminiJson artık
   * fallback olarak çalışır, birincil güvence bu şema.
   */
  export const CHAT_RESPONSE_SCHEMA: GeminiSchema = {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING },
      visual: { type: Type.STRING, nullable: true },
      memories_to_save: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            fact: { type: Type.STRING },
            importance: { type: Type.INTEGER },
          },
          required: ["category", "fact", "importance"],
        },
      },
    },
    required: ["message", "memories_to_save"],
  };

  /**
   * Tek seferlik (non-streaming) Gemini çağrısı.
   * schema verilirse API seviyesinde JSON şeması kilitlenir.
   */
  export async function callGeminiWithFallback(
    prompt: string,
    schema?: GeminiSchema
  ): Promise<string> {
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    let lastError: any;

    for (const modelName of models) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          ...(schema && {
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
          }),
        });
        return result.text?.trim() || "";
      } catch (error) {
        console.warn(`Gemini model ${modelName} failed, trying next...`, error);
        lastError = error;
      }
    }

    throw new Error(`All Gemini models failed: ${lastError?.message}`);
  }

  /**
   * Streaming Gemini çağrısı — her chunk'ı yield eder.
   * Chat route'u bu fonksiyonu kullanarak SSE stream oluşturur.
   * NOT: Structured Output schema ile streaming birlikte kullanılmıyor çünkü
   * JSON token'larını client'ta parse etmek karmaşıklığı artırır. Bunun yerine
   * backend tam metni biriktirip parseGeminiJson ile parse eder.
   */
  export async function callGeminiStream(prompt: string): Promise<AsyncIterable<string>> {
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    let lastError: any;

    for (const modelName of models) {
      try {
        const streamResult = await ai.models.generateContentStream({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        return (async function* () {
          for await (const chunk of streamResult) {
            const text = chunk.text ?? "";
            if (text) yield text;
          }
        })();
      } catch (error) {
        console.warn(`Gemini stream model ${modelName} failed, trying next...`, error);
        lastError = error;
      }
    }

    throw new Error(`All Gemini stream models failed: ${lastError?.message}`);
  }
  ```

- [ ] **Step 3: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
  ```

  Beklenen: hata yok veya sadece mevcut proje hataları (yeni eklenenlerden kaynaklanan hata olmamalı).

- [ ] **Step 4: Commit**

  ```bash
  git add src/lib/gemini.ts
  git commit -m "feat(gemini): add streaming function and optional schema support for structured outputs"
  ```

---

## Task 2: `chat/route.ts` — Parallel DB sorguları

**Files:**
- Modify: `src/app/api/mistik-rehber/chat/route.ts`

Bağımsız 5 DB sorgusunu `Promise.all` ile paralel çalıştır. Premium kontrol ve warmth hesaplaması hâlâ senkron ama artık önceden yüklenen verilerle yapılıyor.

- [ ] **Step 1: route.ts dosyasını oku**

  `src/app/api/mistik-rehber/chat/route.ts` dosyasını oku.

- [ ] **Step 2: Adım 1-7 (DB sorguları) bölümünü şununla değiştir**

  `// 2. Profile çek` ile başlayan bölümden `// 8. Sistem prompt oluştur` satırına kadar olan kısmı aşağıdakiyle değiştir:

  ```typescript
  // 2-7: Tüm bağımsız DB sorgularını paralel çalıştır
  const [
    profileResult,
    convDaysResult,
    memoriesResult,
    recentMessagesResult,
    interactionLogsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("full_name, sun_sign, rising_sign, moon_sign, relationship_status, life_focus, is_premium, birth_chart_summary")
      .eq("id", userId)
      .single(),

    supabaseAdmin
      .from("conversations")
      .select("created_at")
      .eq("user_id", userId)
      .eq("guide_id", guideId),

    supabaseAdmin
      .from("memories")
      .select("category, fact, importance")
      .eq("user_id", userId)
      .eq("guide_id", guideId)
      .order("importance", { ascending: false })
      .limit(20),

    // recentMessages için activeConversationId lazım — önce conversation al
    // Bu sorgu boş döner eğer conversationId henüz yoksa, sorun değil
    conversationId
      ? supabaseAdmin
          .from("messages")
          .select("role, content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),

    supabaseAdmin
      .from("interaction_logs")
      .select("action, meta, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileResult.data;
  if (!profile) {
    return new Response(JSON.stringify({ error: "Profil bulunamadı" }), { status: 404 });
  }

  // Premium kontrolü — convIds için ayrı sorgu gerekiyor (profile'a bağımlı)
  if (!profile.is_premium) {
    const convIds = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("guide_id", guideId)
      .then(r => r.data?.map(c => c.id) || []);

    if (convIds.length > 0) {
      const { count: totalUserMessages } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("role", "user")
        .in("conversation_id", convIds);

      if ((totalUserMessages || 0) >= 5) {
        return new Response(JSON.stringify({ error: "PREMIUM_REQUIRED", limit: 5 }), { status: 402 });
      }
    }
  }

  // Conversation al veya oluştur
  let activeConversationId = conversationId;
  let contextSummary: any = null;

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
      .select("context_summary")
      .eq("id", activeConversationId)
      .single();
    contextSummary = conv?.context_summary || null;
  }

  // Warmth: paralel çekilen convDays verisinden hesapla
  const distinctDays = new Set(
    (convDaysResult.data || []).map(c => new Date(c.created_at).toISOString().split("T")[0])
  ).size;
  const warmthLevel = getWarmthLevel(distinctDays);

  const memories = memoriesResult.data || [];
  const chatHistory = ((recentMessagesResult as any).data || []).reverse();
  const interactionLogs = interactionLogsResult.data || [];
  ```

- [ ] **Step 3: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/api/mistik-rehber/chat/route.ts
  git commit -m "perf(chat-route): parallelize independent DB queries with Promise.all"
  ```

---

## Task 3: `chat/route.ts` — SSE Streaming response

**Files:**
- Modify: `src/app/api/mistik-rehber/chat/route.ts`

Route'u `ReadableStream` (SSE) döndürecek şekilde değiştir. Her Gemini chunk'ı `data: {"delta":"..."}` formatında client'a gönderilir. Stream bitince `data: {"done":true,...}` gönderilir, ardından DB yazma işlemleri yapılır.

- [ ] **Step 1: route.ts import satırlarını güncelle**

  Dosyanın başındaki import satırını şununla değiştir:

  ```typescript
  import { NextRequest } from "next/server";
  import { supabaseAdmin } from "@/lib/supabase-admin";
  import { buildSystemPrompt, buildSummaryPrompt, getWarmthLevel } from "@/lib/guide-prompts";
  import { callGeminiStream, callGeminiWithFallback } from "@/lib/gemini";
  ```

- [ ] **Step 2: `// 9. Gemini'ye gönder` bölümünden sonuna kadar olan tüm kısmı değiştir**

  `// 9. Gemini'ye gönder` yorum satırından `return new Response(...)` dahil sona kadar olan bloğu sil ve yerine şunu koy:

  ```typescript
    // 9. Sistem prompt + geçmiş mesajlar
    const historyText = chatHistory
      .map((m: any) => `${m.role === "user" ? "Kullanıcı" : "Rehber"}: ${m.content}`)
      .join("\n");
    const fullPrompt = `${systemPrompt}\n\n## Konuşma Geçmişi\n${historyText}\n\nKullanıcı: ${message}`;

    // 10. SSE Stream başlat
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";

        try {
          const geminiStream = await callGeminiStream(fullPrompt);

          for await (const delta of geminiStream) {
            fullText += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
            );
          }
        } catch (streamError) {
          // Stream başarısız olursa fallback: full response dön
          console.error("[MistikRehberChat] Stream failed, sending error event", streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "STREAM_FAILED" })}\n\n`)
          );
          controller.close();
          return;
        }

        // JSON parse — prompt her zaman JSON döndürüyor
        let parsed: { message: string; visual?: string | null; memories_to_save: any[] } = {
          message: fullText,
          visual: null,
          memories_to_save: [],
        };
        try {
          const cleaned = fullText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
          parsed = JSON.parse(cleaned);
        } catch {
          // JSON parse başarısızsa ham metni mesaj olarak kullan
          parsed.message = fullText;
        }

        // DB yazma işlemleri (stream bittikten sonra)
        await Promise.all([
          supabaseAdmin.from("messages").insert({
            conversation_id: activeConversationId,
            role: "user",
            content: message,
          }),
          supabaseAdmin.from("messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: parsed.message,
            metadata: parsed.visual ? { visual: parsed.visual } : null,
          }),
          supabaseAdmin
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", activeConversationId),
        ]);

        // Anıları kaydet
        if (parsed.memories_to_save?.length > 0) {
          await Promise.all(
            parsed.memories_to_save.map((mem: any) =>
              supabaseAdmin.from("memories").upsert(
                {
                  user_id: userId,
                  guide_id: guideId,
                  category: mem.category,
                  fact: mem.fact,
                  importance: mem.importance || 1,
                  tags: mem.tags || [],
                  last_referenced_at: new Date().toISOString(),
                },
                { onConflict: "user_id,guide_id,fact", ignoreDuplicates: true }
              )
            )
          );
        }

        // Özet güncelleme (her 20 mesajda arka planda)
        const { count: msgCount } = await supabaseAdmin
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", activeConversationId);

        if (msgCount && msgCount % 20 === 0) {
          (async () => {
            try {
              const { data: allMsgs } = await supabaseAdmin
                .from("messages")
                .select("role, content")
                .eq("conversation_id", activeConversationId)
                .order("created_at", { ascending: true })
                .limit(20);

              const summaryRaw = await callGeminiWithFallback(
                buildSummaryPrompt({ messages: allMsgs || [], previousSummary: contextSummary })
              );
              const cleaned = summaryRaw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
              const summaryJson = JSON.parse(cleaned);

              await supabaseAdmin
                .from("conversations")
                .update({ context_summary: summaryJson })
                .eq("id", activeConversationId);
            } catch (e) {
              console.error("[Summary] Failed:", e);
            }
          })();
        }

        // Done event — client bu event'i alınca side effect'leri uygular
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              conversationId: activeConversationId,
              warmthLevel,
              distinctDays,
              visual: parsed.visual ?? null,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[MistikRehberChat] Error:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası" }), { status: 500 });
  }
  }
  ```

- [ ] **Step 3: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/api/mistik-rehber/chat/route.ts
  git commit -m "feat(chat-route): stream SSE response with Gemini generateContentStream"
  ```

---

## Task 4: `page.tsx` — SSE Stream consumer

**Files:**
- Modify: `src/app/mistik-rehber/chat/[guideId]/page.tsx`

`handleSend` fonksiyonunu SSE stream okuyacak şekilde güncelle. Gelen chunk'lardan `"message"` alanını parse ederek mesaj balonunda canlı text göster. `[DONE]` event'inde conversationId ve visual güncelle.

- [ ] **Step 1: `handleSend` içindeki `try` bloğunu değiştir**

  `handleSend` fonksiyonu içindeki `try { const token = session?.access_token;` ile başlayan ve `} catch (err: any) {` öncesine kadar olan tüm try bloğunu şununla değiştir:

  ```typescript
      try {
        const token = session?.access_token;
        if (!token) throw new Error("AUTH_SESSION_MISSING");

        const res = await fetch("/api/mistik-rehber/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ guideId, message: userMessage, conversationId, language }),
        });

        if (res.status === 402) {
          setPremiumBlocked(true);
          setMessages(prev => prev.filter(m => m.id !== tempId));
          setSending(false);
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "API_ERROR");
        }

        // SSE stream okuyucu
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        const assistantId = genId("assistant");
        let accumulated = "";
        let streamingMessageAdded = false;

        // Streaming assistant mesajını ekle (boş, sonra doldurulacak)
        // setSending(false) burada çağrılıyor ki typing dots ile mesaj aynı anda görünmesin
        const addStreamingMessage = () => {
          if (!streamingMessageAdded) {
            streamingMessageAdded = true;
            setSending(false); // dots'u kapat, streaming mesajı göster
            setMessages(prev => [
              ...prev.filter(m => m.id !== tempId),
              { id: tempId, role: "user", content: userMessage, createdAt: new Date().toISOString() },
              { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() },
            ]);
          }
        };

        // "message" alanının içeriğini JSON token akışından çıkar
        const extractMessageContent = (text: string): string => {
          // JSON stream içinde "message":"..." alanını bul
          const match = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
          if (match) return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          // Kısmi match — henüz kapanmamış string
          const partial = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)/s);
          if (partial) return partial[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          return "";
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: any;
            try { event = JSON.parse(raw); } catch { continue; }

            if (event.error === "STREAM_FAILED") {
              throw new Error("STREAM_FAILED");
            }

            if (event.delta) {
              accumulated += event.delta;
              const messageContent = extractMessageContent(accumulated);
              if (messageContent) {
                addStreamingMessage();
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: messageContent } : m
                ));
              }
            }

            if (event.done) {
              // Nihai güncellemeler
              if (event.conversationId) setConversationId(event.conversationId);
              if (event.warmthLevel) setWarmthLevel(event.warmthLevel);
              if (event.distinctDays !== undefined) setDistinctDays(event.distinctDays);
              if (event.visual) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, metadata: { visual: event.visual } }
                    : m
                ));
              }
            }
          }
        }
      ```

- [ ] **Step 2: `finally` bloğu**

  `} catch (err: any) {` bloğundan sonrasını kontrol et — `setSending(false)` finally'de çağrılıyor olmalı. Değişiklik gerekmez.

- [ ] **Step 3: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 4: Manuel test — geliştirme sunucusu başlat**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npm run dev
  ```

  Test senaryoları:
  1. `/mistik-rehber/chat/melisa` aç
  2. Mesaj gönder → typing dots YERİNE text hemen gelmeye başlamalı
  3. Network tab'da `/api/mistik-rehber/chat` isteği `text/event-stream` olmalı
  4. Premium olmayan kullanıcıda 5 mesaj limiti hâlâ çalışmalı

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/mistik-rehber/chat/[guideId]/page.tsx
  git commit -m "feat(chat-page): consume SSE stream and render assistant message live"
  ```

---

## Task 5: `guide-prompts.ts` — Prompt kalite iyileştirmeleri (Faz 2)

**Files:**
- Modify: `src/lib/guide-prompts.ts`

Dört değişiklik: (1) Adaptive engine'i tablo formatına al, (2) memory injection'ı iç monolog formatına çevir, (3) her karaktere DO_NOT bloğu ekle, (4) contextSummary'yi narrative paragraf olarak inject et.

- [ ] **Step 1: `adaptiveEngine` sabitini değiştir**

  `guide-prompts.ts` dosyasında `const adaptiveEngine = ` satırından kapanan backtick'e kadar olan bloğu şununla değiştir:

  ```typescript
  const adaptiveEngine = `
  ## DURUM MOTORU (Her mesajda tespit et, SADECE o duruma göre davran)

  | Durum | Kullanıcı işareti | Nasıl davranırsın |
  |-------|-------------------|-------------------|
  | CASUAL | Kısa selamlama, naber, geyik | Maks 1-2 cümle. Gizem yok. Analiz yok. |
  | EXPLORING | Test ediyor, az şey paylaşıyor | Kısa + hafif merak uyandır |
  | ENGAGED | Normal konuşuyor | Dengeli. Profil verisini sadece yeri gelince kullan |
  | HOOKED | Derinleşiyor, bağlanıyor | Analiz aç. Narrative Bible'dan katman katman ver |
  | BORED | Kısa, enerjisiz | Pattern kır. Beklenmedik çıkış yap |
  | RESISTANT | Sorguluyor | Eğilme. Hafif meydan oku. Esprili laf sok |
  | EMOTIONAL | Dertli, duygusal | Yavaş tempo. Sadece dinle. Mekanik çözüm verme |
  `;
  ```

- [ ] **Step 2: `memoriesSection` değişkenini değiştir**

  `buildSystemPrompt` fonksiyonu içindeki `const memoriesSection = memories.length > 0` bloğunu şununla değiştir:

  ```typescript
  const memoriesSection = memories.length > 0
    ? `\n## HAFIZANDA KALANLAR (Robot gibi listeleme — içinden biliyormuş gibi, yeri gelince doğal kullan)\n${memories
        .sort((a, b) => b.importance - a.importance)
        .map(m => {
          const importanceHint = m.importance >= 4
            ? "[Derin iz — hassas tut]"
            : m.importance >= 3
            ? "[Önemli — yeri gelince hatırlat]"
            : "[Arka planda tut]";
          return `— ${m.fact} ${importanceHint}`;
        })
        .join("\n")
      }`
    : "";
  ```

- [ ] **Step 3: `contextSummary` injection'ını narrative formata çevir**

  `buildSystemPrompt` return bloğundaki şu satırı:
  ```typescript
  `\n## GEÇMİŞ SOHBET ÖZETİ\n${contextSummary || "İlk karşılaşma."}`,
  ```
  şununla değiştir:
  ```typescript
  `\n## GEÇMİŞ SOHBET BAĞLAMI\n${
    contextSummary
      ? typeof contextSummary === "string"
        ? contextSummary
        : `Bu kişiyle daha önce konuştunuz. Ruh hali: ${contextSummary.mood || "belirsiz"}. Konuştuklarınız: ${(contextSummary.topics || []).join(", ")}. ${contextSummary.raw_summary || ""}`
      : "Bu kişiyle ilk karşılaşmanız."
  }`,
  ```

- [ ] **Step 4: Her karaktere DO_NOT bloğu ekle**

  `characterPrompts` nesnesindeki her karakter için, ilgili karakter stringinin sonuna (kapanan backtick'ten önce) şu satırları ekle:

  **melisa için** (string'in sonuna ekle):
  ```
  DO_NOT: "Canım, tatlım" hitaplarını her mesajda tekrarlama. Anaç ton sürekli değil, sadece gerçekten duygusal anlarda.
  ```

  **aras için**:
  ```
  DO_NOT: Her sohbette estetik/vizyon analizi yapma. Gündelik muhabbette sadece kaprisli ve insani bir arkadaş ol.
  ```

  **umut için**:
  ```
  DO_NOT: Kısa cevap imzanı bozma. "Naber" sorusuna destan yazma. Felsefeyi sadece derinleşen anlarda aç.
  ```

  **hekate için**:
  ```
  DO_NOT: Her cümleyi kitabe gibi kurma. Gündelik enerji düşüklüğünde sen de normal konuş. Gizem kasma sürekli.
  ```

  **selin için**:
  ```
  DO_NOT: "Frekans, kuantum, timeline, blokaj" kelimelerini arka arkaya tekrarlama. Her sohbette manifesting yapma.
  ```

- [ ] **Step 5: TypeScript derleme kontrolü**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
  ```

- [ ] **Step 6: Manuel test — prompt çıktısı kontrolü**

  Dev server açıkken chat sayfasında her karakterle kısa bir selam ("naber") ve uzun bir dertleşme ("annem hasta, ne yapacağımı bilmiyorum") mesajı gönder. Beklenen:
  - CASUAL durumda karakter kısa ve doğal cevap vermeli
  - EMOTIONAL durumda karakter derinleşmeli, hemen çözüm önermemeli

- [ ] **Step 7: Commit**

  ```bash
  git add src/lib/guide-prompts.ts
  git commit -m "feat(prompts): table-format adaptive engine, internal monologue memory, per-character DO_NOT blocks"
  ```

---

## Task 6: Son doğrulama ve temizlik

- [ ] **Step 1: Tüm dosyaların TypeScript derlemesi temiz mi?**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1
  ```

- [ ] **Step 2: Production build testi**

  ```bash
  cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npm run build 2>&1 | tail -20
  ```

  Beklenen: Build başarıyla tamamlanmalı.

- [ ] **Step 3: End-to-end test senaryoları**

  Her senaryoyu browser'da manuel test et:

  | # | Senaryo | Beklenen |
  |---|---------|---------|
  | 1 | Melisa'ya "Merhaba" yaz | Text kelime kelime akmalı, 1-2 cümle, canlı ve kısa |
  | 2 | "Bugün çok bunaldım, ne yapacağımı bilmiyorum" yaz | Derin, empati kuran yanıt, yavaş bir stream |
  | 3 | Network tab: content-type | `text/event-stream` olmalı |
  | 4 | Premium olmayan kullanıcı, 6. mesaj | Premium modal açılmalı |
  | 5 | Sayfa yenile, geçmiş mesajlar | Tüm mesajlar doğru yüklenmiş olmalı |
  | 6 | Tüm 5 rehberle "naber" test et | Hepsi kısa ve karaktere özgü cevap vermeli |

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: Faz1+Faz2 complete — streaming, parallel DB, structured outputs, prompt quality"
  ```

---

## Sonraki Planlar

- **Faz 3:** `docs/superpowers/plans/2026-04-25-companion-os-faz3-semantic-memory.md` — pgvector kurulumu, embedding üretimi, decay sistemi
- **Faz 4:** `docs/superpowers/plans/2026-04-25-companion-os-faz4-persona-drift.md` — conversation graph, persona drift
