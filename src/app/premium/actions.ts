"use server";

import { redirect } from "next/navigation";
import { lemonSqueezySetup, createCheckout as lsCreateCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function initLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
    onError: (error) => {
      console.error("[LemonSqueezy]", error);
    },
  });
}

export type PlanType = "monthly" | "lifetime";

export async function createCheckout(planType: PlanType) {
  // Kullanıcı session kontrolü
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/onboarding");
  }

  // Variant ID seç
  const variantId =
    planType === "lifetime"
      ? process.env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID!
      : process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID!;

  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;

  if (!variantId || !storeId) {
    throw new Error("Lemon Squeezy environment variables eksik");
  }

  initLemonSqueezy();

  const { data, error } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email ?? undefined,
      custom: {
        user_id: user.id,
      },
    },
  });

  if (error || !data?.data?.attributes?.url) {
    console.error("[createCheckout] Hata:", error);
    throw new Error("Checkout oluşturulamadı");
  }

  redirect(data.data.attributes.url);
}
