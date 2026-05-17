const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch (e) {
  console.error("Failed to read .env.local:", e.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("--- Reading Raw Analytics ---");
  const { data, error } = await supabase
    .from('analytics')
    .select('profile_id, event_type, created_at, referrer, device, browser')
    .limit(10);
    
  if (error) {
    console.error("Error reading raw analytics:", error);
  } else {
    console.log(`Raw Analytics Count: ${data.length}`);
    data.forEach((row, i) => {
      console.log(`Row ${i}: profile_id = ${row.profile_id}, event = ${row.event_type}, date = ${row.created_at}, device = ${row.device}, browser = ${row.browser}`);
    });
  }
}

test();
