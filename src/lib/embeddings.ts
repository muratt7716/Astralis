import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase-admin";

let credentials: any = {};
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
} catch {}

const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
  vertexai: true,
  googleAuthOptions: { credentials },
});

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 450));
    const embed = ai.models.embedContent({
      model: "text-embedding-004",
      contents: [{ role: "user", parts: [{ text }] }],
    }).then(response => {
      const values = (response as any).embeddings?.[0]?.values ?? null;
      return Array.isArray(values) ? (values as number[]) : null;
    });
    return await Promise.race([embed, timeout]);
  } catch (err) {
    console.warn("[Embeddings] Failed to generate embedding:", err);
    return null;
  }
}

export async function searchMemoriesByEmbedding(
  userId: string,
  guideId: string,
  queryEmbedding: number[],
  limit = 5
): Promise<Array<{ category: string; fact: string; importance: number }>> {
  try {
    const { data, error } = await supabaseAdmin.rpc("search_memories_by_embedding", {
      p_user_id: userId,
      p_guide_id: guideId,
      p_embedding: queryEmbedding,
      p_limit: limit,
    });
    if (error) {
      console.warn("[Embeddings] RPC search failed:", error.message);
      return [];
    }
    return (data || []) as Array<{ category: string; fact: string; importance: number }>;
  } catch (err) {
    console.warn("[Embeddings] searchMemoriesByEmbedding error:", err);
    return [];
  }
}

export async function saveMemoryEmbeddingBackground(
  userId: string,
  guideId: string,
  fact: string
): Promise<void> {
  const embedding = await generateEmbedding(fact);
  if (!embedding) return;

  await supabaseAdmin
    .from("memories")
    .update({ embedding })
    .eq("user_id", userId)
    .eq("guide_id", guideId)
    .eq("fact", fact);
}
