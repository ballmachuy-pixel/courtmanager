const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// MANUAL ENV PARSING
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [key, ...val] = line.split('=');
      return [key.trim(), val.join('=').trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deepWipe() {
  console.log("🚀 STARTING DEEP WIPE OF OPERATIONAL DATA...");
  
  // Order is important due to Foreign Key constraints
  const tablesToClean = [
    'attendances',
    'staff_checkins',
    'schedule_coaches',
    'schedules',
    'student_classes',
    'students',
    'classes',
    'parents'
  ];

  for (const table of tablesToClean) {
    console.log(`🧹 Wiping table: ${table}...`);
    const { error, count } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
    if (error) {
      console.error(`  ❌ Error wiping ${table}:`, error.message);
    } else {
      console.log(`  ✅ ${table} wiped successfully.`);
    }
  }

  console.log("\n✨ DEEP WIPE COMPLETE. Operational data cleared.");
  console.log("⚠️  Note: Academies and Academy Members (Staff) were preserved.");
}

deepWipe().catch(err => {
  console.error("💀 FATAL ERROR:", err);
  process.exit(1);
});
