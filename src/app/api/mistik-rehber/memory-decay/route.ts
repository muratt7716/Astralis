import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[MemoryDecay] Error:", err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
