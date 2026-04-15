'use server';

import { createAdminClient } from '@/lib/supabase/service';

export async function getParentPortalData(token: string) {
  const supabase = createAdminClient();

  // 1. Fetch Student and parent info via access_token
  const { data: parentProfile, error: profileError } = await supabase
    .from('parent_profiles')
    .select('*, students(*, academies(name, address, phone))')
    .eq('access_token', token)
    .single();

  if (profileError || !parentProfile || !parentProfile.students) {
    return { error: 'Liên kết không hợp lệ.' };
  }

  // Token expiration logic
  if (parentProfile.token_expires_at && new Date(parentProfile.token_expires_at) < new Date()) {
    return { error: 'Liên kết đã hết hạn. Vui lòng yêu cầu cấp lại mã mới từ HLV.' };
  }

  const student = parentProfile.students;
  const studentId = student.id;

  // 2. Fetch Attendances (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: attendances } = await supabase
    .from('attendances')
    .select('date, status, note, classes(name)')
    .eq('student_id', studentId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // 3. Payments removed for privacy - returning empty array
  const payments: any[] = [];

  return {
    student,
    parentProfile,
    attendances: attendances || [],
    payments: payments,
    academy: (student as Record<string, unknown>).academies
  };
}
