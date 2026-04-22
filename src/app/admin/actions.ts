"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type SubscriptionType = "monthly" | "lifetime";

export async function grantPremium(userId: string, type: SubscriptionType) {
  const endDate =
    type === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null; // lifetime has no end date

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      subscription_type: type,
      subscription_end_date: endDate,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function revokePremium(userId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: false,
      subscription_type: null,
      subscription_end_date: null,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
