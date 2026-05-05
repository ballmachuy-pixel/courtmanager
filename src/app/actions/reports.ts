'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';

export async function getStudentReportData(startDate: string, endDate: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  // 1. Fetch Students & their remaining sessions
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select(`
      id, 
      full_name, 
      is_active,
      student_classes(remaining_sessions)
    `)
    .eq('academy_id', academyId)
    .eq('is_active', true);

  if (studentError) throw studentError;
  if (!students || students.length === 0) return [];

  // 2. Fetch Attendances directly by academy_id (v2.0 Optimization)
  const { data: attendances, error: attendanceError } = await supabase
    .from('attendances')
    .select('student_id, status, date')
    .eq('academy_id', academyId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (attendanceError) {
    console.error('Attendance fetch error in report:', attendanceError);
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
    
    // Get remaining sessions (sum if multiple classes, though usually 1)
    const remainingSessions = (student.student_classes as any[])?.reduce((sum, sc) => sum + (sc.remaining_sessions || 0), 0) || 0;

    return {
      'Họ và tên': student.full_name,
      'Số buổi có mặt': presentCount,
      'Số buổi vắng': absentCount,
      'Số buổi đi muộn': lateCount,
      'Số buổi có phép': excusedCount,
      'Tổng buổi ghi nhận': totalSessions,
      'Tỷ lệ chuyên cần (%)': attendanceRate,
      'Số buổi còn lại (Renew)': remainingSessions, // [BẮT BUỘC]
      'Trạng thái': student.is_active ? 'Đang học' : 'Đã nghỉ',
    };
  });

  // Sắp xếp theo tỷ lệ chuyên cần từ THẤP đến CAO
  return reportData.sort((a, b) => a['Tỷ lệ chuyên cần (%)'] - b['Tỷ lệ chuyên cần (%)']);
}


export async function getCoachReportData(startDate: string, endDate: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  // Convert YYYY-MM-DD input to ISO for timestamp comparison
  const startISO = new Date(startDate).toISOString();
  const endISO = new Date(endDate + 'T23:59:59').toISOString();

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
    .gte('created_at', startISO)
    .lte('created_at', endISO)
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

export async function getTopVipStudents() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  // 1. Fetch Students
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id, full_name, avatar_url')
    .eq('academy_id', academyId)
    .eq('is_active', true);

  if (studentError || !students) return [];

  // Lấy ngày đầu tháng hiện tại để tối ưu dữ liệu kéo về (Phương án A)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 2. Fetch all present attendances (Giới hạn trong THÁNG NÀY)
  const { data: attendances, error: attendanceError } = await supabase
    .from('attendances')
    .select('student_id')
    .eq('academy_id', academyId)
    .gte('date', startOfMonth)
    .eq('status', 'present');

  if (attendanceError || !attendances) return [];

  // 3. Count sessions
  const sessionCounts = attendances.reduce((acc: any, curr: any) => {
    acc[curr.student_id] = (acc[curr.student_id] || 0) + 1;
    return acc;
  }, {});

  // 4. Map and sort
  const vipList = students.map(s => ({
    id: s.id,
    full_name: s.full_name,
    avatar_url: s.avatar_url,
    total_sessions: sessionCounts[s.id] || 0
  }))
  .filter(s => s.total_sessions > 0)
  .sort((a, b) => b.total_sessions - a.total_sessions)
  .slice(0, 5); // Top 5

  return vipList;
}
