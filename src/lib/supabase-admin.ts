import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client should ONLY be used in Server Components, API routes, or server-side scripts.
// It uses the Service Role key which bypasses Row Level Security (RLS).
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRole,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
