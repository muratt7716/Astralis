import { supabaseAdmin } from "./src/lib/supabase";

async function check() {
  console.log("Checking interaction_logs columns...");
  const { data, error } = await supabaseAdmin
    .from("interaction_logs")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Column check error:", error);
    return;
  }

  if (data && data.length > 0) {
    console.log("Available Columns:", Object.keys(data[0]));
  } else {
    // If table is empty, we can try to insert a dummy row without metadata to see what columns exist
    const { data: cols, error: colError } = await supabaseAdmin
      .from("interaction_logs")
      .select()
      .limit(0);
    console.log("No data, but columns might be available via select().limit(0)");
  }
}

check();
