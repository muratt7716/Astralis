import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Pricing constants (TRY) — sync with src/locales/tr.ts
const MONTHLY_PRICE = 149.9;

// Only count actual tool usage — skip navigation/view logs
const ACTION_LABELS: Record<string, string> = {
  tarot: "Tarot",
  dream: "Rüya",
  horary: "Horary",
  synastry: "Uyumluluk",
  compatibility: "Uyumluluk",
  birthchart: "Doğum Haritası",
  birth_chart: "Doğum Haritası",
  numerology: "Numeroloji",
  numerology_synthesis_analyze: "Numeroloji",
  bio: "Biyoritim",
  biorhythm_analyze: "Biyoritim",
  biorhythm_synergy_analyze: "Biyoritim",
  sphere: "Kristal Küre",
  iching: "I-Ching",
  runler: "Rünler",
  kahve: "Kahve",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/");
  }

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parallel fetches
  const [
    { data: authData },
    { data: profiles },
    { count: pwaInstallCount },
    { data: logs },
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin
      .from("profiles")
      .select("id, is_premium, subscription_type, subscription_end_date, sun_sign"),
    supabaseAdmin
      .from("pwa_installs")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("interaction_logs")
      .select("action_type")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .limit(10000),
  ]);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const users = (authData?.users ?? []).map((u) => {
    const profile = profileMap.get(u.id) ?? {};
    return {
      id: u.id,
      email: u.email ?? "—",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      is_premium: profile.is_premium ?? false,
      subscription_type: profile.subscription_type ?? null,
      subscription_end_date: profile.subscription_end_date ?? null,
    };
  });

  users.sort((a, b) => {
    if (a.is_premium !== b.is_premium) return a.is_premium ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Analytics
  const newUsersThisWeek = (authData?.users ?? []).filter(
    (u) => new Date(u.created_at) >= oneWeekAgo
  ).length;

  const activeUsers24h = (authData?.users ?? []).filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= twentyFourHoursAgo
  ).length;

  const dailySignups = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const count = (authData?.users ?? []).filter(
      (u) => u.created_at.split("T")[0] === dateStr
    ).length;
    return { date: dateStr, count };
  });

  const expiringProfileIds = new Set(
    (profiles ?? [])
      .filter((p: any) => {
        if (!p.subscription_end_date || !p.is_premium) return false;
        const end = new Date(p.subscription_end_date);
        return end >= now && end <= oneWeekFromNow;
      })
      .map((p: any) => p.id)
  );
  const expiringUsers = users.filter((u) => expiringProfileIds.has(u.id));

  const monthlyPremiumCount = (profiles ?? []).filter(
    (p: any) => p.is_premium && p.subscription_type === "monthly"
  ).length;
  const lifetimePremiumCount = (profiles ?? []).filter(
    (p: any) => p.is_premium && p.subscription_type === "lifetime"
  ).length;

  const estimatedMRR = Math.round(monthlyPremiumCount * MONTHLY_PRICE);

  const sunSignCounts: Record<string, number> = {};
  (profiles ?? []).forEach((p: any) => {
    if (p.sun_sign) sunSignCounts[p.sun_sign] = (sunSignCounts[p.sun_sign] || 0) + 1;
  });
  const sunSignDistribution = Object.entries(sunSignCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([sign, count]) => ({ sign, count }));

  // Popular tools (last 30 days) — skip navigation/view logs not in label map
  const actionCounts: Record<string, number> = {};
  (logs ?? []).forEach((log: any) => {
    const label = ACTION_LABELS[log.action_type];
    if (!label) return; // skip unknown/navigation events
    actionCounts[label] = (actionCounts[label] || 0) + 1;
  });
  const topFortuneTypes = Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([type, count]) => ({ type, count }));

  return (
    <AdminClient
      users={users}
      adminEmail={user.email!}
      pwaInstallCount={pwaInstallCount ?? 0}
      newUsersThisWeek={newUsersThisWeek}
      activeUsers24h={activeUsers24h}
      estimatedMRR={estimatedMRR}
      expiringUsers={expiringUsers}
      dailySignups={dailySignups}
      sunSignDistribution={sunSignDistribution}
      topFortuneTypes={topFortuneTypes}
      monthlyPremiumCount={monthlyPremiumCount}
      lifetimePremiumCount={lifetimePremiumCount}
    />
  );
}
