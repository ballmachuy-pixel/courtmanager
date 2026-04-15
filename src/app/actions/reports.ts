'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';

export async function getStudentReportData(month: number, year: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  // Define date range for the month (YYYY-MM-DD, ICT-safe)
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // 1. Fetch Students of this academy
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id, full_name, is_active')
    .eq('academy_id', academyId)
    .eq('is_active', true);

  if (studentError) throw studentError;
  if (!students || students.length === 0) return [];

  // 2. Fetch Attendances by student_id list (attendances has no academy_id column)
  //    We scope by student_id IN [...] which is safe because students already come from this academy
  const studentIds = students.map(s => s.id);
  const { data: attendances, error: attendanceError } = await supabase
    .from('attendances')
    .select('student_id, status, date')
    .in('student_id', studentIds)
    .gte('date', startDate)
    .lte('date', endDate);

  if (attendanceError) {
    console.error('Attendance fetch error in report:', attendanceError);
    // Non-fatal: still return student list with zeroed counts
  }

  // Transform data for Excel export
  const reportData = students.map(student => {
    const studentAttendances = (attendances || []).filter(a => a.student_id === student.id);
    
    const presentCount = studentAttendances.filter(a => a.status === 'present').length;
    const absentCount = studentAttendances.filter(a => a.status === 'absent').length;
    const lateCount = studentAttendances.filter(a => a.status === 'late').length;
    const excusedCount = studentAttendances.filter(a => a.status === 'excused').length;
    const totalSessions = studentAttendances.length;
    const attendanceRate = totalSessions > 0
      ? Math.round((presentCount / totalSessions) * 100)
      : 0;
    
    return {
      'Họ và tên': student.full_name,
      'Số buổi có mặt': presentCount,
      'Số buổi vắng': absentCount,
      'Số buổi đi muộn': lateCount,
      'Số buổi có phép': excusedCount,
      'Tổng buổi ghi nhận': totalSessions,
      'Tỷ lệ chuyên cần (%)': attendanceRate,
      'Trạng thái': student.is_active ? 'Đang học' : 'Đã nghỉ',
    };
  });

  return reportData;
}


export async function getCoachReportData(month: number, year: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data: checkins, error } = await supabase
    .from('staff_checkins')
    .select(`
      created_at,
      distance_m,
      is_valid,
      notes,
      academy_members!staff_checkins_coach_id_fkey(display_name),
      schedules(classes(name))
    `)
    .eq('academy_id', academyId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return checkins.map((chk: any) => ({
    'Ngày/Giờ': new Date(chk.created_at).toLocaleString('vi-VN'),
    'Huấn luyện viên': chk.academy_members?.display_name,
    'Lớp học': chk.schedules?.classes?.name || 'N/A',
    'Khoảng cách (m)': chk.distance_m || 0,
    'GPS Hợp lệ?': chk.is_valid ? 'Hợp lệ' : 'BÁO ĐỘNG/SAI VỊ TRÍ',
    'Ghi chú': chk.notes || ''
  }));
}
