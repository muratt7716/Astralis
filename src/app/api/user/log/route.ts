import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, actionType, description, metadata } = await req.json();

    if (!userId || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("interaction_logs")
      .insert({
        user_id: userId,
        action_type: actionType,
        description: description || null,
        metadata: metadata || {}
      });

    if (error) {
      console.error("[LogAPI] Database Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[LogAPI] Uncaught Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
