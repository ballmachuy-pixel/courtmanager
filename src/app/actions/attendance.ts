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
  scheduleId: string, // [MỚI] Bắt buộc từ v2.0
  date: string,
  status: 'present' | 'absent' | 'late' | 'excused',
  note: string = ''
) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Xác định người thực hiện điểm danh (HLV)
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  let markerId = null;
  if (token) {
    const session = await verifyCoachSession(token);
    if (session) markerId = session.member_id;
  }

  // Thực hiện UPSERT dựa trên bộ 3: student_id + schedule_id + date
  const { error } = await supabase
    .from('attendances')
    .upsert({
      academy_id: academyId, // Bổ sung để tối ưu báo cáo
      student_id: studentId,
      class_id: classId,
      schedule_id: scheduleId,
      date: date,
      status: status,
      note: note || null,
      marked_by: markerId
    }, {
      onConflict: 'student_id, schedule_id, date'
    });

  if (error) {
    console.error('Mark attendance error:', error);
    throw new Error('Chưa thể lưu điểm danh. Lỗi: ' + error.message);
  }

  // Gửi thông báo cho phụ huynh (Fire and forget)
  const { data: classData } = await supabase.from('classes').select('name').eq('id', classId).single();
  const className = classData?.name || 'Lớp học';
  triggerAttendanceNotification(studentId, className, date, status).catch(console.error);

  revalidatePath('/attendance');
  return { success: true };
}

export async function getAttendanceData(scheduleId: string, date: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // 1. Lấy thông tin Class từ Schedule
  const { data: schedule } = await supabase
    .from('schedules')
    .select('class_id')
    .eq('id', scheduleId)
    .single();

  if (!schedule) throw new Error('Không tìm thấy lịch học');

  // 2. Lấy danh sách học viên của lớp đó
  const { data: enrolled } = await supabase
    .from('student_classes')
    .select('students(id, full_name, avatar_url)')
    .eq('class_id', schedule.class_id);

  // 3. Lấy dữ liệu điểm danh của buổi học (schedule) cụ thể này
  const { data: attendances } = await supabase
    .from('attendances')
    .select('*')
    .eq('schedule_id', scheduleId)
    .eq('date', date);

  return {
    students: enrolled?.map((e: any) => e.students) || [],
    attendances: attendances || []
  };
}

/**
 * Lấy tóm tắt điểm danh theo từng Buổi học (Schedule) cho một ngày nhất định.
 */
export async function getScheduleAttendanceSummary(scheduleIds: string[], date: string) {
  if (!scheduleIds.length) return [];

  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // 1. Lấy danh sách schedule và class_id tương ứng
  const { data: schedules } = await supabase
    .from('schedules')
    .select('id, class_id')
    .in('id', scheduleIds);

  const classIds = schedules?.map(s => s.class_id) || [];

  // 2. Đếm tổng số học viên từng lớp và số đã điểm danh theo từng schedule
  const [{ data: enrolled }, { data: marked }] = await Promise.all([
    supabase
      .from('student_classes')
      .select('class_id')
      .in('class_id', classIds),
    supabase
      .from('attendances')
      .select('schedule_id')
      .in('schedule_id', scheduleIds)
      .eq('date', date),
  ]);

  const totalPerClass: Record<string, number> = {};
  for (const row of enrolled || []) {
    totalPerClass[row.class_id] = (totalPerClass[row.class_id] || 0) + 1;
  }

  const markedPerSchedule: Record<string, number> = {};
  for (const row of marked || []) {
    markedPerSchedule[row.schedule_id] = (markedPerSchedule[row.schedule_id] || 0) + 1;
  }

  return schedules?.map(s => ({
    scheduleId: s.id,
    total: totalPerClass[s.class_id] || 0,
    marked: markedPerSchedule[s.id] || 0,
  })) || [];
}

export async function getDashboardAnalytics() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  // Lấy dữ liệu 7 ngày gần nhất
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const { data: attendances, error } = await supabase
    .from('attendances')
    .select('date, status')
    .eq('academy_id', academyId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }

  // Group data by date
  const chartData = dates.map(date => {
    const dayAttendances = attendances.filter(a => a.date === date);
    return {
      date: date.split('-').slice(1).reverse().join('/'), // Format DD/MM
      present: dayAttendances.filter(a => ['present', 'late'].includes(a.status)).length,
      absent: dayAttendances.filter(a => a.status === 'absent').length,
    };
  });

  return chartData;
}
