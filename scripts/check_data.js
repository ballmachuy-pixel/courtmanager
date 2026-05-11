const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { count: studentsCount, error: err1 } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: staffCount, error: err2 } = await supabase.from('academy_members').select('*', { count: 'exact', head: true });
  const { count: classesCount, error: err3 } = await supabase.from('classes').select('*', { count: 'exact', head: true });
  
  console.log('--- DỮ LIỆU HIỆN TẠI TRONG DATABASE ---');
  console.log(`- Số lượng Học viên: ${studentsCount || 0}`);
  console.log(`- Số lượng Nhân sự (HLV & Admin): ${staffCount || 0}`);
  console.log(`- Số lượng Lớp học: ${classesCount || 0}`);
}

checkData().catch(console.error);
