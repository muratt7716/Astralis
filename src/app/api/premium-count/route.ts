import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic to ensure we get the absolute real-time count without caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase keys for premium count");
      return NextResponse.json({ count: 184 }); // Fallback
    }

    // Initialize with service role to bypass RLS and efficiently count all profiles
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_type", "lifetime");

    if (error) {
      console.error("Supabase count error:", error);
      throw error;
    }
    
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching lifetime premium count:", error);
    return NextResponse.json({ count: 184 }); // Fallback on error so UI doesn't break
  }
}
