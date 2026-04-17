import { supabase } from "@/lib/supabase";

/**
 * Log a user interaction to the database for personalization tracking.
 */
export async function logInteraction(userId: string, actionType: string, description?: string) {
  try {
    const { error } = await supabase
      .from("interaction_logs")
      .insert({
        user_id: userId,
        action_type: actionType,
        description: description || null
      });

    if (error) console.error("Logging Error:", error);
  } catch (err) {
    console.error("Logging failed:", err);
  }
}
