'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { verifyCoachSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { triggerAttendanceNotification } from '@/lib/services/notification';

export async function markAttendance(
  studentId: string,
  classId: string,
  date: string,
  status: 'present' | 'absent' | 'late' | 'excused',
  note: string = ''
) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  let markerId = null;
  if (token) {
    const session = await verifyCoachSession(token);
    if (session) markerId = session.member_id;
  }

  const { error } = await supabase
    .from('attendances')
    .upsert({
      student_id: studentId,
      class_id: classId,
      date: date,
      status: status,
      note: note || null,
      marked_by: markerId
    }, {
      onConflict: 'student_id, class_id, date'
    });

  if (error) {
    console.error('Mark attendance error:', error);
    throw new Error('Chưa thể lưu điểm danh');
  }

  const { data: classData } = await supabase.from('classes').select('name').eq('id', classId).single();
  const className = classData?.name || 'Lớp học';

  triggerAttendanceNotification(studentId, className, date, status).catch(console.error);

  revalidatePath('/attendance');
  return { success: true };
}

export async function getAttendanceData(classId: string, date: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data: enrolled } = await supabase
    .from('student_classes')
    .select('students(id, full_name, avatar_url)')
    .eq('class_id', classId);

  const { data: attendances } = await supabase
    .from('attendances')
    .select('*')
    .eq('class_id', classId)
    .eq('date', date);

  return {
    students: enrolled?.map((e: any) => e.students) || [],
    attendances: attendances || []
  };
}

/**
 * Returns per-class attendance progress for a given date.
 * Powers the class tab badges: "6/10 đã điểm danh"
 */
export async function getClassAttendanceSummary(classIds: string[], date: string) {
  if (!classIds.length) return [];

  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const [{ data: enrolled }, { data: marked }] = await Promise.all([
    supabase
      .from('student_classes')
      .select('class_id')
      .in('class_id', classIds),
    supabase
      .from('attendances')
      .select('class_id')
      .in('class_id', classIds)
      .eq('date', date),
  ]);

  const totalMap: Record<string, number> = {};
  const markedMap: Record<string, number> = {};

  for (const row of enrolled || []) {
    totalMap[row.class_id] = (totalMap[row.class_id] || 0) + 1;
  }
  for (const row of marked || []) {
    markedMap[row.class_id] = (markedMap[row.class_id] || 0) + 1;
  }

  return classIds.map(id => ({
    classId: id,
    total: totalMap[id] || 0,
    marked: markedMap[id] || 0,
  }));
}
