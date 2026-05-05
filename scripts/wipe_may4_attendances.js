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

async function wipeMay4() {
  console.log("🚀 XÓA LỊCH SỬ ĐIỂM DANH NGÀY 04/05/2026...");
  
  const { error, count } = await supabase
    .from('attendances')
    .delete({ count: 'exact' })
    .eq('date', '2026-05-04');
  
  if (error) {
    console.error(`❌ Lỗi khi xóa:`, error.message);
  } else {
    console.log(`✅ Đã xóa thành công ${count} bản ghi điểm danh của ngày mùng 4.`);
  }
}

wipeMay4().catch(err => {
  console.error("💀 FATAL ERROR:", err);
  process.exit(1);
});
