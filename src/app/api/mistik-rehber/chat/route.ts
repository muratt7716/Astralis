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

    // 1. Auth — header'dan token al
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
      .select("full_name, sun_sign, rising_sign, moon_sign, relationship_status, life_focus, is_premium, birth_chart_summary")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profil bulunamadı" }), { status: 404 });
    }

    // 3. Premium kontrolü — değilse toplam user mesaj sayısına bak
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

    // 4. Conversation al veya oluştur
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
      profile: {
        ...profile,
        birth_chart_summary: (profile as any).birth_chart_summary ?? null,
      },
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

    // 14. Her 20 mesajda özet güncelle (arka planda)
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
