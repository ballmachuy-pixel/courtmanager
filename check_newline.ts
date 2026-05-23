import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- 1. TÌM ACADEMY NEW LINE ---');
  const { data: academies } = await supabase.from('academies').select('id, name').ilike('name', '%new line%');
  console.log(academies);

  if (!academies || academies.length === 0) return;
  const academyId = academies[0].id;

  console.log('\n--- 2. TÌM 3 LỚP HỌC ---');
  const { data: classes, error: classErr } = await supabase.from('classes').select('id, name').eq('academy_id', academyId);
  console.log(classes, classErr);

  console.log('\n--- 3. KIỂM TRA HLV TRONG LỚP (class_coaches) ---');
  if (classes) {
    for (const c of classes) {
      const { data: classCoaches } = await supabase.from('class_coaches').select('coach_id, is_primary, coaches(name)').eq('class_id', c.id);
      console.log(`Lớp ${c.name}:`, classCoaches);
    }
  }

  console.log('\n--- 4. KIỂM TRA HỌC VIÊN TRONG LỚP ---');
  if (classes) {
    for (const c of classes) {
      const { count } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('class_id', c.id);
      console.log(`Lớp ${c.name}: ${count} học viên`);
    }
  }
}

main().catch(console.error);
