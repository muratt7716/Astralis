import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminClient from "./AdminClient";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminPage() {
  // 1. Get current session
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/");
  }

  // 2. Fetch all users from auth + profiles
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, is_premium, subscription_type, subscription_end_date");

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p])
  );

  const users = (authData?.users ?? []).map((u) => {
    const profile = profileMap.get(u.id) ?? {};
    return {
      id: u.id,
      email: u.email ?? "—",
      created_at: u.created_at,
      is_premium: profile.is_premium ?? false,
      subscription_type: profile.subscription_type ?? null,
      subscription_end_date: profile.subscription_end_date ?? null,
    };
  });

  // Sort: premium first, then by created_at desc
  users.sort((a, b) => {
    if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return <AdminClient users={users} adminEmail={user.email!} />;
}
