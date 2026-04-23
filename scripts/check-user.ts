import { supabaseAdmin } from "../src/lib/supabase-admin";

async function checkUser(userId: string) {
  console.log("Checking user:", userId);

  // 1. Check Profile
  const { data: profile, error: pError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (pError) {
    console.error("Profile Error:", pError.message);
  } else {
    console.log("Profile DB State:", {
      is_premium: profile.is_premium,
      subscription_type: profile.subscription_type,
      subscription_end_date: profile.subscription_end_date,
    });
  }

  // 2. Check Auth User Metadata
  const { data: { user }, error: uError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (uError) {
    console.error("Auth Error:", uError.message);
  } else if (user) {
    console.log("Auth User Metadata:", user.app_metadata);
  }
}

const targetUserId = process.argv[2] || "19323083-8585-4f28-a239-457bbe59c567";
checkUser(targetUserId);
