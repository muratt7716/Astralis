// src/app/api/mistik-rehber/chat/route.ts
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSystemPrompt, buildSummaryPrompt, getWarmthLevel } from "@/lib/guide-prompts";
import { callGeminiWithFallback, callGeminiStream } from "@/lib/gemini";

export const runtime = "nodejs";

function parseGeminiJson(text: string) {
  const cleaned = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { guideId, message, conversationId, language } = await req.json();

    if (!guideId || !message) {
      return new Response(JSON.stringify({ error: "guideId ve message zorunlu" }), { status: 400 });
    }

    // 1. Auth — header'dan token al
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      console.error("[MistikRehberChat] No token provided in header");
      return new Response(JSON.stringify({ error: "Unauthorized: No token" }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error("[MistikRehberChat] Auth error or user not found:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;
    console.log(`[MistikRehberChat] User ${userId} is chatting with guide ${guideId}`);

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

      // recentMessages için conversationId lazım — henüz yoksa boş döner
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

    // Premium kontrolü — convIds için profile'a bağımlı ayrı sorgu
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
    const chatHistory = ((recentMessagesResult as any).data || []).reverse() as Array<{ role: string; content: string }>;
    const interactionLogs = interactionLogsResult.data || [];

    // 8. Sistem prompt oluştur
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
    });

    // 9. Prompt oluştur
    const historyText = chatHistory
      .map(m => `${m.role === "user" ? "Kullanıcı" : "Rehber"}: ${m.content}`)
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        } catch (streamError) {
          console.error("[MistikRehberChat] Stream failed:", streamError);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "STREAM_FAILED" })}\n\n`));
          controller.close();
          return;
        }

        // JSON parse — prompt her zaman JSON döndürüyor
        let parsed: { message: string; visual?: string | null; memories_to_save: Array<{ category: string; fact: string; importance: number; tags?: string[] }> } = {
          message: fullText,
          visual: null,
          memories_to_save: [],
        };
        try {
          parsed = parseGeminiJson(fullText);
        } catch {
          parsed.message = fullText;
        }

        // DB yazmaları paralel — stream bittikten sonra
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
            parsed.memories_to_save.map(mem =>
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

        // Her 20 mesajda özet güncelle (arka planda — stream'i bloklamaz)
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
              const summaryJson = parseGeminiJson(summaryRaw);
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
