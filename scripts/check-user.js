const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

// Custom env loader because .env.local isn't standard for dotenv
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1];
        let val = match[2].trim();
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  console.log("URL:", supabaseUrl ? "OK" : "MISSING");
  console.log("KEY:", serviceRoleKey ? "OK" : "MISSING");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function checkUser(userId) {
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
    console.log("Auth User app_metadata:", user.app_metadata);
    console.log("Auth User user_metadata:", user.user_metadata);
  }
}

const targetUserId = process.argv[2] || "19323083-8585-4f28-a239-457bbe59c567";
checkUser(targetUserId);
