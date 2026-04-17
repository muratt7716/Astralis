import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // 1. Fetch interaction logs for the user, grouped by action_type
    const { data: logs, error } = await supabaseAdmin
      .from("interaction_logs")
      .select("action_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    // 2. Aggregate tool usage
    const toolCounts: Record<string, number> = {};
    logs.forEach((log: any) => {
      // Filter out non-tool actions if necessary
      if (['tarot', 'dream', 'bio', 'sphere', 'astrology', 'numerology', 'kahve'].includes(log.action_type)) {
        toolCounts[log.action_type] = (toolCounts[log.action_type] || 0) + 1;
      }
    });

    // 3. Sort and pick top 3
    const topTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    return NextResponse.json({ topTools });
  } catch (err: any) {
    console.error("Top Tools API Error:", err);
    return NextResponse.json({ error: "Failed to fetch top tools" }, { status: 500 });
  }
}
