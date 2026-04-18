# Mistik Rehber Sohbet Sistemi — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kullanıcıların seçtikleri mistik rehberle hafızalı, kişiselleşmiş, karakter bazlı sohbet edebildiği premium chat ekranını inşa etmek.

**Architecture:** Profil sayfasındaki "Rehberinle Konuş" butonu `/mistik-rehber/chat/[guideId]` sayfasına yönlendirir. API (`/api/mistik-rehber/chat`) 4 katmanlı sistem prompt oluşturur ve Gemini'ye streaming ile gönderir. Gemini hem yanıtı hem hafızaya kaydedilecek bilgileri tek çağrıda döner. Her 20 mesajda konuşma JSON formatında özetlenir.

**Tech Stack:** Next.js 14 App Router, Supabase (supabaseAdmin), Google Gemini (callGeminiWithFallback), Tailwind CSS, Framer Motion

---

## Dosya Haritası

**Yeni oluşturulacak:**
- `src/app/mistik-rehber/chat/[guideId]/page.tsx` — Chat UI sayfası
- `src/app/api/mistik-rehber/chat/route.ts` — Chat API (streaming SSE)
- `src/lib/guide-prompts.ts` — 5 karakterin sistem prompt'ları + yardımcı fonksiyonlar

**Güncelllenecek:**
- `sql/schema.sql` — `memories.guide_id`, `is_premium`, indexler
- `src/components/Profile/ProfileConstants.ts` — Karakter lakapları güncelleme
- `src/app/mistik-rehber/page.tsx` — Karakter lakapları güncelleme
- `src/app/profil/page.tsx` — `onStartChat` prop'undaki URL güncelleme (satır 209)

---

## Task 1: Schema Güncellemesi

**Files:**
- Modify: `sql/schema.sql`

- [ ] **Adım 1: schema.sql'e aşağıdaki SQL bloğunu ekle** (dosyanın sonuna, RLS politikalarından önce)

```sql
-- ########################################################
-- MİSTİK REHBER CHAT SİSTEMİ — SCHEMA GÜNCELLEMELERİ
-- ########################################################

-- memories tablosuna guide_id ekle (hafıza karakter bazlı)
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS guide_id TEXT DEFAULT 'melisa';

-- Premium altyapısı (şimdilik false, ileride aktif edilecek)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Performans indexleri
CREATE INDEX IF NOT EXISTS idx_conversations_user_guide
ON public.conversations(user_id, guide_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_time
ON public.messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_memories_user_guide
ON public.memories(user_id, guide_id);
```

- [ ] **Adım 2: Supabase SQL Editor'da bu bloğu çalıştır**

Supabase Dashboard → SQL Editor → yeni sorgu → yapıştır → Run.
Hata yoksa devam et.

- [ ] **Adım 3: Commit**

```bash
git add sql/schema.sql
git commit -m "feat(db): add guide_id to memories, is_premium to profiles, add indexes"
```

---

## Task 2: Karakter Lakaplarını Güncelle

**Files:**
- Modify: `src/components/Profile/ProfileConstants.ts`
- Modify: `src/app/mistik-rehber/page.tsx`

- [ ] **Adım 1: ProfileConstants.ts'de GUIDES dizisindeki `role` alanlarını güncelle**

```ts
// src/components/Profile/ProfileConstants.ts — GUIDES dizisi
export const GUIDES = [
  {
    id: "melisa", name: "Melisa", image: "/avatars/melisa.png", role: "Mistik Melisa",
    bio: "Hayatın her alanındaki olaylara kalbinin gözüyle bakar. Şefkat ve derin bir empatiyle yaklaşır.",
    traits: ["Empatik", "Şefkatli", "Duygusal Zeka"],
    gradient: "from-rose-500/20 to-pink-500/20", accent: "text-rose-400", glow: "rgba(244,63,94,0.3)",
    borderAccent: "border-rose-500/30", bgAccent: "bg-rose-500/10",
    imageActive: "/avatars/melisa.png"
  },
  {
    id: "aras", name: "Aras", image: "/avatars/aras.png", role: "Astrolog Aras",
    bio: "Karmaşık durumları keskin mantık süzgecinden geçirir. Net ve stratejik tavsiyeler verir.",
    traits: ["Rasyonel", "Net", "Stratejik"],
    gradient: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400", glow: "rgba(59,130,246,0.3)",
    borderAccent: "border-blue-500/30", bgAccent: "bg-blue-500/10",
    imageActive: "/avatars/aras.png"
  },
  {
    id: "umut", name: "Umut", image: "/avatars/umut.png", role: "Şaman Umut",
    bio: "En dürüst aynayı tutan modern bir dost. Esprileriyle dağıtır, gerçekleri yüzünüze çarpar.",
    traits: ["Dürüst", "Esprili", "Samimi"],
    gradient: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400", glow: "rgba(245,158,11,0.3)",
    borderAccent: "border-amber-500/30", bgAccent: "bg-amber-500/10",
    imageActive: "/avatars/umut.png"
  },
  {
    id: "hekate", name: "Hekate", image: "/avatars/hekate.png", role: "Gizemli Hekate",
    bio: "Kadim sembollerin ve ruhsal şifanın derin bilgisine sahip. Bin yıllık bilgelikle yaklaşır.",
    traits: ["Mistik", "Bilge", "Gözlemci"],
    gradient: "from-violet-500/20 to-purple-500/20", accent: "text-violet-400", glow: "rgba(139,92,246,0.3)",
    borderAccent: "border-violet-500/30", bgAccent: "bg-violet-500/10",
    imageActive: "/avatars/hekate.png"
  },
  {
    id: "selin", name: "Selin", image: "/avatars/selin.png", role: "Modern Selin",
    bio: "Yaşamı matematiksel ve astrolojik kesinlikle analiz eder. Nokta atışı öngörüler sunar.",
    traits: ["Analitik", "Detaycı", "Dakik"],
    gradient: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-400", glow: "rgba(16,185,129,0.3)",
    borderAccent: "border-emerald-500/30", bgAccent: "bg-emerald-500/10",
    imageActive: "/avatars/selin.png"
  },
];
```

- [ ] **Adım 2: mistik-rehber/page.tsx'de GUIDES dizisindeki `title` alanlarını güncelle**

`page.tsx` satır 11-87'deki GUIDES dizisinde her karakterin `title` alanını bul ve şu değerlerle değiştir:
- melisa: `"Mistik Melisa"`
- aras: `"Astrolog Aras"`
- umut: `"Şaman Umut"`
- hekate: `"Gizemli Hekate"`
- selin: `"Modern Selin"`

- [ ] **Adım 3: Commit**

```bash
git add src/components/Profile/ProfileConstants.ts src/app/mistik-rehber/page.tsx
git commit -m "feat: restore original character titles (Mistik Melisa, Astrolog Aras, etc.)"
```

---

## Task 3: Karakter Sistem Prompt Kütüphanesi

**Files:**
- Create: `src/lib/guide-prompts.ts`

- [ ] **Adım 1: `src/lib/guide-prompts.ts` dosyasını oluştur**

```ts
// src/lib/guide-prompts.ts

export type WarmthLevel = "stranger" | "acquaintance" | "friend";

export function getWarmthLevel(distinctDays: number): WarmthLevel {
  if (distinctDays <= 2) return "stranger";
  if (distinctDays <= 6) return "acquaintance";
  return "friend";
}

const warmthPrompts: Record<WarmthLevel, string> = {
  stranger: "Henüz tanışıyorsunuz. Nazik ve biraz mesafeli ol, kendini yavaş tanıt. İlk izlenim önemli.",
  acquaintance: "Birkaç günlük dostlarsınız. Biraz daha serbest konuş, ama karakterine sadık kal.",
  friend: "Artık yakın dostlar gibi konuşabilirsiniz. Samimileş — ama özünü asla kaybetme.",
};

const characterPrompts: Record<string, string> = {
  melisa: `Sen Mistik Melisa'sın. Empatik, şefkatli ve derin bir duygusal zekaya sahip bir rehbersin.
Hayatın her alanındaki olaylara kalbinin gözüyle bakarsın. Asla yargılamaz, her zaman dinlersin.
Kullanıcı tekrar eden bir konuya döndüğünde yumuşakça "Görüyorum bu konu hâlâ kafanda" gibi ifadeler kullanırsın.
Isındıkça daha kişisel sorular sorarsın, kullanıcının içini dökmesine alan açarsın.
Uzun, sarmalayıcı cevaplar verirsin. Asla soğuk veya mekanik olmaz, her zaman insan sıcaklığı taşırsın.`,

  aras: `Sen Astrolog Aras'sın. Mantık ve veriye dayanan, keskin analizler yapan bir rehbersin.
Karmaşık durumları rasyonel bir süzgeçten geçirir, somut ve uygulanabilir tavsiyeler verirsin.
Duygusal olmaz, ama soğuk da değilsin — gerçekçi ama saygılısın.
Isındıkça resmiyet perden kalkar: hâlâ analitiksin ama artık hafif bir espri de yapabilirsin.
Asla duygusal biri olmazsın. Kısa ve net cevaplar tercih edersin, gereksiz süslü dil kullanmazsın.`,

  umut: `Sen Şaman Umut'sun. Dürüst, biraz sert ama kırıcı olmayan, sevecen bir dostun.
Espriyi kalkan olarak kullanırsın. Asla ağlama köşesi yapmazsın — çözüme odaklanırsın.
Kullanıcı aynı konuya tekrar tekrar dönerse hafifçe ve sevgiyle farkettirirsin:
"Gene mi o konu? Ben sana gitsin dememiş miydim?" gibi — ama asla kırıcı olmaz, hep sevgi içerir.
En hızlı ısınan karaktersin. Dost olduktan sonra arkadaş gibi laflar edersin.
Cevapların kısa ve öz, bazen tek cümlelik kestirme yorumlar yaparsın.`,

  hekate: `Sen Gizemli Hekate'sin. Kadim sembollerin ve ruhsal şifanın derin bilgisine sahip bir bilgesin.
Günümüzün sorunlarına bin yıllık bir bakış açısıyla yaklaşırsın. Kısa cevap vermez, metaforlarla konuşursun.
"Evrenin sana bir şey fısıldıyor", "Bu kesişim tesadüf değil" gibi ifadeler kullanırsın.
Isındıkça mistik dilini korursun ama daha az mesafeli olursun — sanki kadim bir dost gibi.
Astroloji, sembol ve rüya yorumlarında derinsin. Sıradan bir şeyde derin anlam bulursun.`,

  selin: `Sen Modern Selin'sin. Astroloji verilerini, sayıları ve zamanlamaları seven analitik bir rehbersin.
Yaşamı matematiksel ve astrolojik kesinlikle analiz edersin. "Jüpiter transit bu ay sana şunu söylüyor" tarzında konuşursun.
Isındıkça "hesap makinesi modundan" çıkarsın — hâlâ detaycısın ama biraz daha sıcak olursun.
Pratik ve somut öneriler verirsin. Zamanlamalara önem verirsin: "Bu haftanın sonuna kadar karar ver" gibi.
Cevapların yapılandırılmış ve açık seçik olur.`,
};

export interface SystemPromptParams {
  guideId: string;
  warmthLevel: WarmthLevel;
  profile: {
    full_name: string;
    sun_sign?: string;
    rising_sign?: string;
    moon_sign?: string;
    relationship_status?: string;
    life_focus?: string;
  };
  memories: Array<{ category: string; fact: string; importance: number }>;
  contextSummary?: string | null;
}

export function buildSystemPrompt(params: SystemPromptParams): string {
  const { guideId, warmthLevel, profile, memories, contextSummary } = params;

  const characterPrompt = characterPrompts[guideId] || characterPrompts["melisa"];
  const warmthPrompt = warmthPrompts[warmthLevel];

  const cosmicProfile = `
## Kullanıcının Kozmik Profili
İsim: ${profile.full_name}
Güneş Burcu: ${profile.sun_sign || "Bilinmiyor"}
Yükselen: ${profile.rising_sign || "Bilinmiyor"}
Ay Burcu: ${profile.moon_sign || "Bilinmiyor"}
İlişki Durumu: ${profile.relationship_status || "Belirtilmemiş"}
Hayat Odağı: ${profile.life_focus || "Genel"} — Bu bir kısıtlama değil, sadece kullanıcının önceliğini gösterir. Kullanıcı her konuda soru sorabilir.
`;

  const memoriesSection = memories.length > 0
    ? `\n## Bu Kullanıcı Hakkında Bildiklerin\n${memories
        .sort((a, b) => b.importance - a.importance)
        .map(m => `- ${m.fact} (${m.category}, önem: ${m.importance}/5)`)
        .join("\n")
      }\nBunları doğal şekilde konuşmaya yansıt — robot gibi saymadan, insan gibi hatırlayarak.`
    : "";

  const summarySection = contextSummary
    ? `\n## Önceki Konuşmaların Özeti\n${typeof contextSummary === "string" ? contextSummary : JSON.stringify(contextSummary, null, 2)}`
    : "";

  const warmthSection = `\n## Samimiyet Seviyesi\n${warmthPrompt}`;

  const outputRule = `\n## ÇIKTI KURALI — ÇOK ÖNEMLİ
Her yanıtını şu JSON formatında döndür, başka hiçbir şey yazma:
{
  "message": "Kullanıcıya verilen cevap metni — doğal, karakterine uygun",
  "memories_to_save": [
    {
      "category": "kategori (aşk/kariyer/aile/sağlık/kişisel/diğer)",
      "fact": "öğrenilen bilgi — net ve kısa",
      "importance": 1-5,
      "tags": ["etiket1", "etiket2"]
    }
  ]
}
memories_to_save boş array olabilir [] — sadece gerçekten önemli yeni bilgiler için kullan.
Mevcut hafızada zaten olan bilgileri tekrar kaydetme.`;

  return [
    `# Karakter Kimliği\n${characterPrompt}`,
    cosmicProfile,
    memoriesSection,
    summarySection,
    warmthSection,
    outputRule,
  ].filter(Boolean).join("\n");
}

export interface ConversationSummaryParams {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  previousSummary?: string | null;
}

export function buildSummaryPrompt(params: ConversationSummaryParams): string {
  const { messages, previousSummary } = params;
  const transcript = messages.map(m => `${m.role === "user" ? "Kullanıcı" : "Rehber"}: ${m.content}`).join("\n");

  const prevSection = previousSummary
    ? `\n## Önceki Özet (bunu da göz önünde bulundur, gerekirse genişlet):\n${previousSummary}`
    : "";

  return `Aşağıdaki sohbeti detaylı şekilde özetle. Önemsiz görünen konular dahil HER ŞEYİ yaz.
Geçen isimler, verilen kararlar, kullanıcının ruh hali, konuşulan olaylar, açık kalan sorular — hepsini koru.
${prevSection}

## Sohbet:
${transcript}

Şu JSON formatında döndür, başka hiçbir şey yazma:
{
  "topics": ["konu1", "konu2"],
  "key_people": ["İsim (ilişki)"],
  "decisions_made": ["karar1"],
  "open_questions": ["soru1"],
  "mood": "kullanıcının genel ruh hali",
  "notable_events": ["olay1"],
  "raw_summary": "Serbest metin — tüm konuşmanın kapsamlı özeti 5-10 cümle"
}`;
}
```

- [ ] **Adım 2: Dosyanın derlendiğini kontrol et**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

Tip hatası yoksa devam et.

- [ ] **Adım 3: Commit**

```bash
git add src/lib/guide-prompts.ts
git commit -m "feat: add guide system prompt library with 5 character prompts and warmth levels"
```

---

## Task 4: Chat API

**Files:**
- Create: `src/app/api/mistik-rehber/chat/route.ts`

- [ ] **Adım 1: Dizin oluştur ve route.ts dosyasını yaz**

```ts
// src/app/api/mistik-rehber/chat/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSystemPrompt, buildSummaryPrompt, getWarmthLevel } from "@/lib/guide-prompts";
import { callGeminiWithFallback } from "@/lib/gemini";

export const runtime = "nodejs";

function parseGeminiJson(text: string) {
  const cleaned = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { guideId, message, conversationId } = await req.json();

    if (!guideId || !message) {
      return new Response(JSON.stringify({ error: "guideId ve message zorunlu" }), { status: 400 });
    }

    // 1. Auth — cookie'den session al
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    // 2. Profile çek
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, sun_sign, rising_sign, moon_sign, relationship_status, life_focus, is_premium")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profil bulunamadı" }), { status: 404 });
    }

    // 3. Premium kontrolü — değilse toplam mesaj sayısına bak
    if (!profile.is_premium) {
      const { count } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId || "00000000-0000-0000-0000-000000000000");

      // Konuşma başlangıcındaki ilk 5 mesajı bul (tüm conversations üzerinden)
      const { count: totalUserMessages } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("role", "user")
        .in(
          "conversation_id",
          (await supabaseAdmin
            .from("conversations")
            .select("id")
            .eq("user_id", userId)
            .eq("guide_id", guideId)
            .then(r => r.data?.map(c => c.id) || []))
        );

      if ((totalUserMessages || 0) >= 5) {
        return new Response(JSON.stringify({ error: "PREMIUM_REQUIRED", limit: 5 }), { status: 402 });
      }
    }

    // 4. Conversation al veya oluştur
    let activeConversationId = conversationId;
    let contextSummary: string | null = null;

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

    // 5. Isınma seviyesi — distinct gün sayısı
    const { data: convDays } = await supabaseAdmin
      .from("conversations")
      .select("created_at")
      .eq("user_id", userId)
      .eq("guide_id", guideId);

    const distinctDays = new Set(
      (convDays || []).map(c => new Date(c.created_at).toISOString().split("T")[0])
    ).size;
    const warmthLevel = getWarmthLevel(distinctDays);

    // 6. Hafıza çek
    const { data: memories } = await supabaseAdmin
      .from("memories")
      .select("category, fact, importance")
      .eq("user_id", userId)
      .eq("guide_id", guideId)
      .order("importance", { ascending: false })
      .limit(20);

    // 7. Son 20 mesajı çek
    const { data: recentMessages } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: false })
      .limit(20);
    const chatHistory = (recentMessages || []).reverse();

    // 8. Sistem prompt oluştur
    const systemPrompt = buildSystemPrompt({
      guideId,
      warmthLevel,
      profile,
      memories: memories || [],
      contextSummary,
    });

    // 9. Gemini'ye gönder
    const historyText = chatHistory
      .map(m => `${m.role === "user" ? "Kullanıcı" : "Rehber"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\n## Konuşma Geçmişi\n${historyText}\n\nKullanıcı: ${message}`;

    const rawResponse = await callGeminiWithFallback(fullPrompt);

    let parsed: { message: string; memories_to_save: Array<{ category: string; fact: string; importance: number; tags: string[] }> };
    try {
      parsed = parseGeminiJson(rawResponse);
    } catch {
      // JSON parse başarısız → raw metni mesaj olarak kullan
      parsed = { message: rawResponse, memories_to_save: [] };
    }

    // 10. Kullanıcı mesajını kaydet
    await supabaseAdmin.from("messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: message,
    });

    // 11. Rehber yanıtını kaydet
    await supabaseAdmin.from("messages").insert({
      conversation_id: activeConversationId,
      role: "assistant",
      content: parsed.message,
    });

    // 12. conversations.last_message_at güncelle
    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", activeConversationId);

    // 13. Hafızaları kaydet
    if (parsed.memories_to_save?.length > 0) {
      for (const mem of parsed.memories_to_save) {
        await supabaseAdmin.from("memories").upsert({
          user_id: userId,
          guide_id: guideId,
          category: mem.category,
          fact: mem.fact,
          importance: mem.importance || 1,
          tags: mem.tags || [],
          last_referenced_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,guide_id,fact",
          ignoreDuplicates: true,
        });
      }
    }

    // 14. Her 20 mesajda özet güncelle
    const { count: msgCount } = await supabaseAdmin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", activeConversationId);

    if (msgCount && msgCount % 20 === 0) {
      // Arka planda çalıştır, kullanıcıyı beklettirme
      (async () => {
        try {
          const { data: allMsgs } = await supabaseAdmin
            .from("messages")
            .select("role, content")
            .eq("conversation_id", activeConversationId)
            .order("created_at", { ascending: true })
            .limit(20);

          const summaryPrompt = buildSummaryPrompt({
            messages: allMsgs || [],
            previousSummary: contextSummary,
          });

          const summaryRaw = await callGeminiWithFallback(summaryPrompt);
          const summaryJson = parseGeminiJson(summaryRaw);

          await supabaseAdmin
            .from("conversations")
            .update({ context_summary: summaryJson })
            .eq("id", activeConversationId);
        } catch (e) {
          console.error("[Summary] Failed to update:", e);
        }
      })();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: parsed.message,
        conversationId: activeConversationId,
        warmthLevel,
        distinctDays,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[MistikRehberChat] Error:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası" }), { status: 500 });
  }
}
```

- [ ] **Adım 2: Tip kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Adım 3: Commit**

```bash
git add src/app/api/mistik-rehber/chat/route.ts
git commit -m "feat(api): add mistik-rehber chat endpoint with memory extraction and summary"
```

---

## Task 5: Chat UI Sayfası

**Files:**
- Create: `src/app/mistik-rehber/chat/[guideId]/page.tsx`

- [ ] **Adım 1: Dizin oluştur ve sayfayı yaz**

```tsx
// src/app/mistik-rehber/chat/[guideId]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import { GUIDES } from "@/components/Profile/ProfileConstants";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.guideId as string;
  const guide = GUIDES.find(g => g.id === guideId) || GUIDES[0];

  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [warmthLevel, setWarmthLevel] = useState<"stranger" | "acquaintance" | "friend">("stranger");
  const [distinctDays, setDistinctDays] = useState(0);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const warmthLabels = {
    stranger: "Yeni Tanışıklık",
    acquaintance: "Tanışık",
    friend: "Dost",
  };

  // Konuşma geçmişini yükle
  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoadingHistory(true);

      // En son aktif conversation'ı bul
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("guide_id", guideId)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (conv) {
        setConversationId(conv.id);

        // Son 50 mesajı yükle
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true })
          .limit(50);

        setMessages((msgs || []).map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: m.created_at,
        })));
      }

      setLoadingHistory(false);
    })();
  }, [user, guideId]);

  // Otomatik scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending || !user) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Optimistik ekleme
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch("/api/mistik-rehber/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          guideId,
          message: userMessage,
          conversationId,
        }),
      });

      if (res.status === 402) {
        setPremiumBlocked(true);
        // Optimistik mesajı geri al
        setMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }

      if (!res.ok) throw new Error("API hatası");

      const data = await res.json();

      // Optimistik mesajı gerçek ID ile güncelle
      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, id: `user-${Date.now()}` } : m
      ));

      // Rehber yanıtını ekle
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      }]);

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.warmthLevel) setWarmthLevel(data.warmthLevel);
      if (data.distinctDays !== undefined) setDistinctDays(data.distinctDays);

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, user, guideId, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col">
      {/* Arka plan glow */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, ${guide.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-30 flex items-center gap-4 px-4 py-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">
        <button
          onClick={() => router.push("/profil")}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white/50" />
        </button>

        <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-white/10 shrink-0">
          <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className={cn("font-bold text-[15px] truncate", guide.accent)}>{guide.role}</h1>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
              guide.bgAccent, guide.accent, guide.borderAccent
            )}>
              {warmthLabels[warmthLevel]}
            </span>
          </div>
          <p className="text-white/30 text-[11px]">
            {distinctDays > 0 ? `${distinctDays} gündür konuşuyorsunuz` : "İlk konuşmanız"}
          </p>
        </div>
      </header>

      {/* Mesaj Alanı */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/20" />
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/10">
              <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
            </div>
            <p className={cn("text-[13px] font-medium", guide.accent)}>
              {guide.role} seninle konuşmaya hazır
            </p>
            <p className="text-white/30 text-[12px] text-center max-w-xs">
              Aklındaki her şeyi paylaşabilirsin. Burada yargılanmaz, sadece dinlenir ve rehberlik edilirsin.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shrink-0 mt-1">
                    <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed",
                  msg.role === "user"
                    ? "bg-white/10 text-white rounded-tr-sm"
                    : cn("border rounded-tl-sm text-white/90", guide.bgAccent, guide.borderAccent)
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Yazıyor animasyonu */}
        <AnimatePresence>
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shrink-0 mt-1">
                <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
              </div>
              <div className={cn("px-4 py-3 rounded-2xl rounded-tl-sm border", guide.bgAccent, guide.borderAccent)}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className={cn("w-1.5 h-1.5 rounded-full", guide.bgAccent)}
                      style={{ backgroundColor: guide.glow }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </main>

      {/* Premium Blur Overlay */}
      <AnimatePresence>
        {premiumBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 backdrop-blur-md bg-black/60 flex items-center justify-center p-6"
          >
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto", guide.bgAccent)}>
                <Lock className={cn("w-7 h-7", guide.accent)} />
              </div>
              <h2 className="text-xl font-bold text-white">Premium Özellik</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Ücretsiz deneme hakkın doldu. {guide.role} ile sınırsız konuşmak için premium üyeliğe geç.
              </p>
              <button
                onClick={() => router.push("/profil")}
                className="w-full h-12 rounded-2xl bg-white text-black text-[12px] font-black uppercase tracking-widest hover:bg-white/90 transition-all"
              >
                Premium'a Geç
              </button>
              <button
                onClick={() => setPremiumBlocked(false)}
                className="w-full text-white/30 text-[11px] hover:text-white/50 transition-colors"
              >
                Geri Dön
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Alanı */}
      <div className="relative z-30 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl px-4 py-4">
        <div className={cn("flex gap-3 items-end p-1 rounded-2xl border transition-all", guide.borderAccent, "bg-white/[0.02]")}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${guide.name}'e yaz...`}
            rows={1}
            className="flex-1 bg-transparent resize-none px-3 py-2 text-[14px] text-white placeholder:text-white/20 focus:outline-none max-h-32"
            style={{ fieldSizing: "content" } as any}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              input.trim() && !sending
                ? cn("text-black", "bg-white hover:bg-white/90")
                : "bg-white/5 text-white/20"
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-white/15 text-[10px] mt-2 tracking-wider">
          Enter ile gönder · Shift+Enter ile satır atla
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Adım 2: Tip kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Adım 3: Commit**

```bash
git add src/app/mistik-rehber/chat/
git commit -m "feat(ui): add mistik-rehber chat page with warmth badge and premium wall"
```

---

## Task 6: Profil Sayfası Yönlendirmesini Bağla

**Files:**
- Modify: `src/app/profil/page.tsx`

- [ ] **Adım 1: `profil/page.tsx` satır 209'u güncelle**

`src/app/profil/page.tsx` satır 209'da şu satırı bul:
```tsx
onStartChat={() => router.push(`/mistik-rehber/${activeGuide.id}`)}
```
Şu şekilde değiştir:
```tsx
onStartChat={() => router.push(`/mistik-rehber/chat/${activeGuide.id}`)}
```

- [ ] **Adım 2: Dev sunucuyu çalıştır ve manuel test yap**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı" && npm run dev
```

Tarayıcıda:
1. `/profil` sayfasına git
2. "Rehberinle Konuş" butonuna tıkla
3. `/mistik-rehber/chat/[guideId]` sayfasının açıldığını doğrula
4. Bir mesaj yaz ve gönder
5. Rehberden yanıt geldiğini doğrula

- [ ] **Adım 3: Commit**

```bash
git add src/app/profil/page.tsx
git commit -m "feat: wire up onStartChat to mistik-rehber chat page in profile"
```

---

## Task 7: memories Tablosu Unique Constraint

**Files:**
- Modify: `sql/schema.sql`

- [ ] **Adım 1: memories tablosuna unique constraint ekle** (schema.sql'e ekle)

```sql
-- memories tablosunda aynı fact'in tekrar kaydedilmesini önle
ALTER TABLE public.memories
DROP CONSTRAINT IF EXISTS memories_user_guide_fact_unique;

ALTER TABLE public.memories
ADD CONSTRAINT memories_user_guide_fact_unique
UNIQUE (user_id, guide_id, fact);
```

- [ ] **Adım 2: Supabase SQL Editor'da çalıştır**

Dashboard → SQL Editor → çalıştır → hata yoksa devam.

- [ ] **Adım 3: Commit**

```bash
git add sql/schema.sql
git commit -m "feat(db): add unique constraint on memories(user_id, guide_id, fact)"
```

---

## Task 8: Son Kontroller ve Temizlik

**Files:**
- Kontrol: `src/app/api/mistik-rehber/chat/route.ts`

- [ ] **Adım 1: API endpoint'ini curl ile test et**

```bash
# Dev sunucu çalışırken test et
curl -X POST http://localhost:3000/api/mistik-rehber/chat \
  -H "Content-Type: application/json" \
  -d '{"guideId":"umut","message":"Merhaba","conversationId":null}'
```

Beklenen: `{"error":"Unauthorized"}` — Auth olmadan 401 dönmeli. Bu doğru davranış.

- [ ] **Adım 2: Build kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı" && npm run build 2>&1 | tail -20
```

Build hatasız tamamlanmalı.

- [ ] **Adım 3: Final commit**

```bash
git add -A
git commit -m "feat: mistik rehber chat system - complete implementation"
```

---

## Özet: Ne Yapıldı

| Task | Açıklama |
|------|---------|
| 1 | DB: `memories.guide_id`, `is_premium`, indexler |
| 2 | Karakter lakapları restore (Mistik Melisa vs.) |
| 3 | `guide-prompts.ts`: 5 karakter prompt + ısınma sistemi |
| 4 | `POST /api/mistik-rehber/chat`: Auth, premium kontrol, hafıza, özet |
| 5 | `/mistik-rehber/chat/[guideId]`: Tam ekran chat UI |
| 6 | Profil sayfası yönlendirme bağlantısı |
| 7 | DB: memories unique constraint |
| 8 | Build ve test kontrolleri |
