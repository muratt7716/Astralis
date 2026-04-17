import { supabase } from "@/lib/supabase";

/**
 * Map of routes to user-friendly action types for logging
 */
export const ROUTE_ACTION_MAP: Record<string, string> = {
  "/uyumluluk": "compatibility",
  "/dogum-haritasi": "birth_chart",
  "/biyoritim": "bio",
  "/ruya-analizi": "dream",
  "/numeroloji": "numerology",
  "/fallar/iching": "iching",
  "/fallar/runler": "runler",
  "/fallar/kristal": "sphere",
};

/**
 * Normalizes a pathname to match the action map by removing language prefixes (e.g., /tr/profil -> /profil)
 */
export function getActionByPath(path: string): string | null {
  // Remove trailing slashes
  const normalizedPath = path.replace(/\/$/, "");
  
  // Try direct match
  if (ROUTE_ACTION_MAP[normalizedPath]) return ROUTE_ACTION_MAP[normalizedPath];
  
  // Try matching without language prefix (e.g. /tr /en)
  const withoutPrefix = normalizedPath.replace(/^\/(tr|en)/, "");
  if (ROUTE_ACTION_MAP[withoutPrefix]) return ROUTE_ACTION_MAP[withoutPrefix];
  
  // Return null if no match found
  return null;
}

/**
 * Log a user interaction to the database for personalization tracking.
 */
export async function logInteraction(userId: string, actionType: string, description?: string, metadata: any = {}) {
  try {
    console.log(`[ActivityLog] Forwarding to API: ${actionType}`);
    
    // We call our internal API route which handles logging via supabaseAdmin
    const res = await fetch("/api/user/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        actionType,
        description,
        metadata
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("[ActivityLog] API Error:", errData.error);
    } else {
      console.log(`[ActivityLog] Success: ${actionType} logged via API.`);
    }
  } catch (err) {
    console.error("[ActivityLog] Uncaught failure:", err);
  }
}
