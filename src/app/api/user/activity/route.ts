import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "UserId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("interaction_logs")
    .select("*")
    .eq("user_id", userId)
    .not("action_type", "in", '("profile_visit","guide_gallery_visit","zodiac_list","horoscope_view","compatibility_view","birth_chart_view")')
    .not("description", "ilike", '%Visited:%')
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data });
}
