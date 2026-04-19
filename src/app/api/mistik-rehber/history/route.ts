import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Auth — header'dan token al
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guideId = req.nextUrl.searchParams.get("guideId");
    if (!guideId) {
      return NextResponse.json({ error: "guideId gerekli" }, { status: 400 });
    }

    // Son conversation'ı bul
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("guide_id", guideId)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ conversationId: null, messages: [], warmthLevel: "stranger", distinctDays: 0 });
    }

    // Mesajları çek
    const { data: msgs } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(50);

    // Isınma seviyesi
    const { data: convDays } = await supabaseAdmin
      .from("conversations")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("guide_id", guideId);

    const distinctDays = new Set(
      (convDays || []).map(c => new Date(c.created_at).toISOString().split("T")[0])
    ).size;

    const warmthLevel = distinctDays >= 7 ? "friend" : distinctDays >= 3 ? "acquaintance" : "stranger";

    return NextResponse.json({
      conversationId: conv.id,
      messages: (msgs || []).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
      warmthLevel,
      distinctDays,
    });
  } catch (err) {
    console.error("[MistikRehberHistory] Error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
