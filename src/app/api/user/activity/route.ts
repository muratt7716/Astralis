import { supabase } from "@/lib/supabase"; // Correctly using the standard client
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "UserId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("interaction_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ activities: data });
}
