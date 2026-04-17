'use server';

import { createAdminClient } from '@/lib/supabase/service';

export async function getParentPortalData(token: string) {
  const supabase = createAdminClient();

  // 1. Fetch Parent info via access_token
  const { data: parent, error: parentError } = await supabase
    .from('parents')
    .select('*, academies(name, address, phone)')
    .eq('access_token', token)
    .single();

  if (parentError || !parent) {
    return { error: 'Liên kết không hợp lệ hoặc đã bị thu hồi.' };
  }

  // Token expiration logic
  if (parent.token_expires_at && new Date(parent.token_expires_at) < new Date()) {
    return { error: 'Liên kết đã hết hạn. Vui lòng yêu cầu cấp lại mã mới từ HLV.' };
  }

  // 2. Fetch ALL students linked to this parent
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', parent.id)
    .eq('is_active', true);

  if (studentsError || !students || students.length === 0) {
    return { error: 'Không tìm thấy dữ liệu học viên liên kết.' };
  }

  const studentIds = students.map(s => s.id);

  // 3. Fetch Attendances for ALL students (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: attendances } = await supabase
    .from('attendances')
    .select('student_id, date, status, note, classes(name)')
    .in('student_id', studentIds)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  return {
    parent,
    students,
    attendances: attendances || [],
    academy: parent.academies
  };
}
