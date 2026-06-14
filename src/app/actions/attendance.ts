'use server';

import { requireAdminAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { verifyCoachSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { triggerAttendanceNotification } from '@/lib/services/notification';
import { AttendanceService, validateAttendanceDate } from '@/lib/services/attendance.service';
import { createAdminClient } from '@/lib/supabase/service';

export async function markAttendance(
  studentId: string,
  classId: string,
  scheduleId: string,
  date: string,
  status: 'present' | 'absent' | 'late' | 'excused',
  note: string = ''
) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  // Xác định người thực hiện điểm danh (HLV)
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  let markerId = null;
  if (token) {
    const session = await verifyCoachSession(token);
    if (session) markerId = session.member_id;
  }

  // [DIAMOND v6] Use AttendanceService for business rules
  const validation = validateAttendanceDate(date, note);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const attendanceService = new AttendanceService(academyId);
  const { error } = await attendanceService.upsertAttendanceRecord(
    { studentId, classId, scheduleId, date, status, note: validation.finalNote || undefined },
    markerId || ''
  );

  if (error) {
    console.error('Mark attendance error:', error);
    throw new Error('Chưa thể lưu điểm danh: ' + error.message);
  }

  // Gửi thông báo cho phụ huynh (Fire and forget an toàn)
  const supabase = createAdminClient();
  const { data: classData } = await supabase.from('classes').select('name').eq('id', classId).single();
  const className = classData?.name || 'Lớp học';
  try {
    triggerAttendanceNotification(studentId, className, date, status).catch(e => {
      console.error('[NotificationService] Gửi thông báo thất bại, luồng admin vẫn an toàn:', e);
    });
  } catch (err) {
    console.error('[NotificationService] Lỗi hệ thống:', err);
  }

  revalidatePath('/attendance');
  return { success: true };
}

export async function getAttendanceData(scheduleId: string, date: string) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const attendanceService = new AttendanceService(academyId);
  const { data, error } = await attendanceService.getAttendanceDetails(scheduleId, date);
  
  if (error || !data) throw error || new Error('Không thể tải dữ liệu điểm danh');
  return data;
}

export async function getScheduleAttendanceSummary(scheduleIds: string[], date: string) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const attendanceService = new AttendanceService(academyId);
  const { data, error } = await attendanceService.getSchedulesSummary(scheduleIds, date);
  
  if (error) throw error;
  return data || [];
}

export async function getDashboardAnalytics() {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const attendanceService = new AttendanceService(academyId);
  const { data, error } = await attendanceService.getAttendanceAnalytics();
  
  if (error || !data) {
    if (error) console.error('Error fetching analytics:', error);
    return [];
  }

  return data;
}
