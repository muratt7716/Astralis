"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function deleteActivity(activityId: string) {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin
    .from("interaction_logs")
    .delete()
    .eq("id", activityId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}

export async function clearAllActivities() {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");

  // Only delete the visible interaction logs (filter same as GET API)
  const { error } = await supabaseAdmin
    .from("interaction_logs")
    .delete()
    .eq("user_id", userId)
    .not("action_type", "in", '("profile_visit","guide_gallery_visit","zodiac_list","horoscope_view","compatibility_view","birth_chart_view")')
    .not("description", "ilike", '%Visited:%');

  if (error) throw new Error(error.message);
  revalidatePath("/profil");
}
