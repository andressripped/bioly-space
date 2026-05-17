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

async function runPolicyInspection() {
  console.log("Inspecting RLS policies on 'analytics'...");

  // Try to query the policy rules from pg_policies via a raw postgres call
  // Since we might not have raw SQL execution, we'll try to perform a dummy SELECT 
  // mimicking an authenticated session or checking for SELECT errors.
  
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .limit(1);
    
  if (error) {
    console.error("❌ SELECT error on analytics:", error);
  } else {
    console.log("✅ SELECT successful! Rows returned:", data);
  }
}

runPolicyInspection();
