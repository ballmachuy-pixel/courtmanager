const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// MANUAL ENV PARSING (to avoid extra dependencies)
const envPath = path.join(__dirname, '.env.local');
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

const TARGET_EMAILS = [
  'tester_quinn@example.com',
  'quinn.diamond.test@gmail.com',
  'tester_new@example.com'
];

async function deepClean() {
  console.log("💎 DIAMOND CLEANUP INITIATED...");
  
  for (const email of TARGET_EMAILS) {
    console.log(`\n🔍 Processing account: ${email}`);
    
    // 1. Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("❌ Error listing users:", userError.message);
      continue;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`⚠️ User not found: ${email}. Skipping.`);
      continue;
    }
    
    const userId = user.id;
    console.log(`✅ Found User ID: ${userId}`);

    // 2. Find Academies owned by this user
    const { data: academies, error: academyError } = await supabase
      .from('academies')
      .select('id')
      .eq('owner_id', userId);

    if (academyError) {
      console.error("❌ Error fetching academies:", academyError.message);
      continue;
    }

    const academyIds = academies.map(a => a.id);
    console.log(`🏢 Found ${academyIds.length} academies to clean.`);

    if (academyIds.length > 0) {
      // 3. Delete related data (Order matters for foreign keys)
      console.log("🧹 Wiping operational data...");
      
      const tablesToClean = [
        'attendance',
        'staff_checkins',
        'schedules',
        'student_classes',
        'students',
        'classes',
        'parents'
      ];

      for (const table of tablesToClean) {
        const { error } = await supabase
          .from(table)
          .delete()
          .in('academy_id', academyIds);
        
        if (error) {
          console.log(`  - ❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`  - ✅ Table ${table}: Cleaned.`);
        }
      }

      // 4. Delete Academies
      const { error: delAcademyError } = await supabase
        .from('academies')
        .delete()
        .in('id', academyIds);
      
      if (delAcademyError) {
        console.error("❌ Error deleting academies:", delAcademyError.message);
      } else {
        console.log("✅ Academies removed.");
      }
    }

    console.log(`✨ Cleanup finished for ${email}`);
  }

  console.log("\n🚀 DEEP CLEAN COMPLETE. Systems ready for Diamond Standard Test.");
}

deepClean().catch(err => {
  console.error("💀 UNEXPECTED ERROR:", err);
  process.exit(1);
});
