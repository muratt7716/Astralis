"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type SubscriptionType = "monthly" | "lifetime";

export async function grantPremium(userId: string, type: SubscriptionType) {
  const endDate =
    type === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null; // lifetime has no end date

  // 0. Fetch user to get required fields for potential insert/upsert (solves NOT NULL constraint errors)
  const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (fetchError || !user) throw new Error("Kullanıcı bulunamadı: " + (fetchError?.message || "Auth yetkisi yok"));

  // 1. Sync Profile (Upsert ensures it exists, providing NOT NULL fields from metadata)
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Yeni Kullanıcı",
      birth_date: user.user_metadata?.birth_date || "2000-01-01",
      email: user.email,
      is_premium: true,
      subscription_type: type,
      subscription_end_date: endDate,
      updated_at: new Date().toISOString(),
    });

  if (profileError) throw new Error(profileError.message);

  // 2. Sync Auth Metadata (Critical for RLS and JWT-based checks)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { is_premium: true }
  });

  if (authError) console.error("Auth metadata sync warning:", authError.message);

  revalidatePath("/admin");
  revalidatePath("/profil");
}

export async function revokePremium(userId: string) {
  // 1. Sync Profile
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: false,
      subscription_type: null,
      subscription_end_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  // 2. Sync Auth Metadata
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { is_premium: false }
  });

  if (authError) console.error("Auth metadata sync warning:", authError.message);

  revalidatePath("/admin");
  revalidatePath("/profil");
}
