const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

let supabaseUrl = "";
let supabaseAnonKey = "";

const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.split("=")[1].replace(/['"]/g, "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseAnonKey = trimmed.split("=")[1].replace(/['"]/g, "").trim();
    }
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runRecentCount() {
  console.log("Querying database for the 20 absolute most recent rows in 'analytics'...");

  const { data: rows, error: countError } = await supabase
    .from("analytics")
    .select("profile_id, event_type, referrer, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (countError) {
    console.error("❌ Error fetching analytics:", countError);
  } else {
    console.log(`✅ Fetched the most recent ${rows.length} rows successfully.`);
    rows.forEach((r, idx) => {
      console.log(`${idx + 1}. Profile: ${r.profile_id} | Event: ${r.event_type} | Ref: ${r.referrer} | Created At: ${r.created_at}`);
    });
  }
}

runRecentCount();
