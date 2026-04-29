"use server";

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export type PlanType = "monthly" | "lifetime";

/**
 * Shopier ürün URL'sini döndürür (client tarafında yeni sekmede açılacak).
 * Server action olarak kullanıcı session kontrolü yapar.
 */
export async function getCheckoutUrl(planType: PlanType): Promise<string> {
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
    throw new Error("NOT_AUTHENTICATED");
  }

  // Shopier ürün URL'sini seç
  const productUrl =
    planType === "lifetime"
      ? process.env.SHOPIER_LIFETIME_PRODUCT_URL
      : process.env.SHOPIER_MONTHLY_PRODUCT_URL;

  if (!productUrl) {
    throw new Error("Shopier ürün URL'si yapılandırılmamış (.env.local)");
  }

  return productUrl;
}
