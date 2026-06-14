'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId, requireAdminAcademyId } from '@/lib/server-utils';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getICTDateString, getICTStartOfDayUTC } from '@/lib/utils';
import { verifyCoachSession } from '@/lib/auth-utils';
import { triggerAttendanceNotification } from '@/lib/services/notification';
import {
  validateGeofence,
  parseScheduleGPS,
} from '@/lib/services/checkin.service';
import { AttendanceService, validateAttendanceDate } from '@/lib/services/attendance.service';
import { StaffService } from '@/lib/services/staff.service';

// [AUDIT FIX] Haversine + Geofence logic now imported from checkin.service.ts
// to comply with architecture: "Logic nghiệp vụ không được rò rỉ ra ngoài thư mục services."

/**
 * Lấy ID thành viên của Coach từ phiên đăng nhập hiện tại
 */
async function getCoachMemberId(academyId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const coachToken = cookieStore.get('coach_session')?.value;
  const coachSession = coachToken ? await verifyCoachSession(coachToken) : null;
  
  const staffService = new StaffService(academyId);

  // 1. Identify coach via Supabase Auth (Admin Portal)
  if (user) {
    const memberId = await staffService.resolveMemberId(user.id);
    if (memberId) return memberId;
  }

  // 2. Fallback: Identify coach via custom Coach Session (Coach Portal)
  if (coachSession) {
    // Security Fix: Đảm bảo HLV không thể thao tác chéo trung tâm
    if (coachSession.academy_id !== academyId) {
      console.warn(`[Security] Coach ${coachSession.member_id} from ${coachSession.academy_id} tried to access ${academyId}`);
      return null;
    }
    // Session token already contains member_id
    return coachSession.member_id;
  }

  return null;
}

export async function processCoachCheckin(data: {
  academyId: string;
  scheduleId?: string;
  latitude: number | null;
  longitude: number | null;
  notes?: string;
  forceSave?: boolean;
}) {
  const coachMemberId = await getCoachMemberId(data.academyId);
  if (!coachMemberId) {
    return { error: 'Tài khoản không thuộc trung tâm này hoặc phiên đăng nhập hết hạn' };
  }

  const staffService = new StaffService(data.academyId);
  const supabaseAdmin = createAdminClient(); // Still need for academy settings

  const { data: academy } = await supabaseAdmin
    .from('academies')
    .select('latitude, longitude, allowed_radius_m')
    .eq('id', data.academyId)
    .single();

  // [MULTI-LOCATION UPGRADE]
  let targetLat = academy?.latitude ?? null;
  let targetLng = academy?.longitude ?? null;
  let targetRadius = academy?.allowed_radius_m ?? 300;

  if (data.scheduleId) {
    const { data: schedule } = await supabaseAdmin
      .from('schedules')
      .select('location, location_id')
      .eq('id', data.scheduleId)
      .single();

    if (schedule?.location_id) {
      const { data: loc } = await supabaseAdmin
        .from('academy_locations')
        .select('latitude, longitude, allowed_radius_m')
        .eq('id', schedule.location_id)
        .single();
      
      if (loc && loc.latitude && loc.longitude) {
        targetLat = loc.latitude;
        targetLng = loc.longitude;
        if (loc.allowed_radius_m) targetRadius = loc.allowed_radius_m;
      }
    } else {
      // Fallback: Try to parse from legacy location string
      const parsed = parseScheduleGPS(schedule?.location);
      if (parsed) {
        targetLat = parsed.latitude;
        targetLng = parsed.longitude;
      }
    }
  }

  const geofence = validateGeofence(
    { latitude: data.latitude, longitude: data.longitude },
    { latitude: targetLat, longitude: targetLng, allowed_radius_m: targetRadius },
    data.notes
  );

  const distance = geofence.distance;
  const isValid = geofence.isValid;

  if (!isValid && !data.forceSave) {
    return { 
      requiresExplanation: true, 
      warningMessage: geofence.warningMessage,
      distance: distance ? Math.round(distance) : null
    };
  }

  const { data: result, error } = await staffService.processCheckin({
    memberId: coachMemberId,
    scheduleId: data.scheduleId,
    latitude: data.latitude,
    longitude: data.longitude,
    isValid,
    distance,
    notes: geofence.notes || undefined
  });

  if (error) return { error: 'Lỗi ghi nhận check-in' };
  if ((result as any)?.alreadyExists) return { success: true, alreadyExists: true };

  revalidatePath('/coach');
  revalidatePath('/dashboard');
  
  return { success: true, isValid, distance };
}


export async function overrideCheckin(checkinId: string) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('staff_checkins')
    .update({
      is_valid: true,
      notes: 'Được xác nhận thủ công bởi Admin'
    })
    .eq('id', checkinId)
    .eq('academy_id', academyId);

  if (error) {
    console.error('Override Checkin Error:', error);
    throw new Error('Không thể xác nhận hộ');
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function markAttendance(attendanceData: {
  studentId: string;
  classId: string;
  scheduleId: string; // [MỚI] Bắt buộc từ v2.0
  status: 'present' | 'absent' | 'late' | 'excused';
}) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();
  const dateStr = getICTDateString();

  // [AUDIT FIX] Use AttendanceService for consistency
  const validation = validateAttendanceDate(dateStr);
  if (!validation.isValid) {
    return { error: validation.error };
  }

  const coachId = await getCoachMemberId(academyId);
  if (!coachId) {
    return { error: 'Không thể xác định danh tính Huấn luyện viên.' };
  }

  const attendanceService = new AttendanceService(academyId);

  // [AUDIT FIX] Use centralized service for DB write
  const { error } = await attendanceService.upsertAttendanceRecord(
    {
      studentId: attendanceData.studentId,
      classId: attendanceData.classId,
      scheduleId: attendanceData.scheduleId,
      date: dateStr,
      status: attendanceData.status
    },
    coachId
  );

  if (error) {
    console.error("Attendance mark error", error);
    return { error: 'Lỗi ghi nhận điểm danh: ' + error.message };
  }

  // [AUDIT FIX] Gửi thông báo cho phụ huynh (Fire and forget) an toàn
  const { data: classData } = await supabase.from('classes').select('name').eq('id', attendanceData.classId).single();
  const className = classData?.name || 'Lớp học';
  try {
    // Không dùng await để không block Request, nhưng vẫn bọc try-catch để tránh crash Node.js (Unhandled Rejection)
    triggerAttendanceNotification(attendanceData.studentId, className, dateStr, attendanceData.status).catch(e => {
      console.error('[NotificationService] Gửi thông báo Zalo/Push thất bại, nhưng luồng điểm danh vẫn an toàn:', e);
    });
  } catch (err) {
    console.error('[NotificationService] Crash phòng ngừa:', err);
  }

  revalidatePath(`/coach/classes/${attendanceData.scheduleId}`);
  return { success: true };
}

export async function unmarkAttendance(data: {
  studentId: string;
  scheduleId: string;
}) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();
  const dateStr = getICTDateString();

  const { error } = await supabase
    .from('attendances')
    .delete()
    .eq('academy_id', academyId)
    .eq('student_id', data.studentId)
    .eq('schedule_id', data.scheduleId)
    .eq('date', dateStr);

  if (error) {
    console.error("Attendance unmark error", error);
    return { error: 'Lỗi hủy điểm danh: ' + error.message };
  }

  revalidatePath(`/coach/classes/${data.scheduleId}`);
  return { success: true };
}

export async function markAssistantAttendance(data: {
  academyId: string;
  scheduleId: string;
  assistantCoachId: string;
  isPresent: boolean;
}) {
  const supabase = createAdminClient();
  const todayStart = getICTStartOfDayUTC();

  const callerId = await getCoachMemberId(data.academyId);
  if (!callerId) throw new Error('Unauthorized');

  if (data.isPresent) {
    // [ANTI RACE-CONDITION] Kiểm tra HLV phụ đã được check-in trong ca này hôm nay chưa
    const { data: existingCheckin } = await supabase
      .from('staff_checkins')
      .select('id')
      .eq('schedule_id', data.scheduleId)
      .eq('coach_id', data.assistantCoachId)
      .gte('created_at', todayStart.toISOString())
      .single();

    if (existingCheckin) {
      // Idempotent: đã có rồi → bỏ qua, không insert trùng
      return { success: true };
    }

    // Lấy tên HLV trưởng để ghi audit trail
    const { data: callerMember } = await supabase
      .from('academy_members')
      .select('display_name')
      .eq('id', callerId)
      .single();
    const callerName = callerMember?.display_name || `ID:${callerId}`;

    const { error } = await supabase
      .from('staff_checkins')
      .insert({
        academy_id: data.academyId,
        schedule_id: data.scheduleId,
        coach_id: data.assistantCoachId,
        is_valid: true,
        notes: `Được bảo lãnh bởi HLV Trưởng: ${callerName}`
      });
      
    if (error) {
      console.error('Error marking assistant', error);
      throw new Error(error.message);
    }
  } else {
    // Delete checkin if un-toggled
    const { error } = await supabase
      .from('staff_checkins')
      .delete()
      .eq('schedule_id', data.scheduleId)
      .eq('coach_id', data.assistantCoachId)
      .gte('created_at', todayStart.toISOString());
      
    if (error) {
      console.error('Error unmarking assistant', error);
      throw new Error(error.message);
    }
  }

  revalidatePath(`/coach/classes/${data.scheduleId}`);
  return { success: true };
}

export async function markAttendanceBulk(data: {
  classId: string;
  scheduleId: string; // [MỚI]
  studentIds: string[];
  status: 'present' | 'absent' | 'late' | 'excused';
}) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  if (data.studentIds.length === 0) return { success: true };

  const supabase = createAdminClient();
  const dateStr = getICTDateString();

  const attendanceService = new AttendanceService(academyId);
  
  const inputs = data.studentIds.map(studentId => ({
    studentId,
    classId: data.classId,
    scheduleId: data.scheduleId,
    date: dateStr,
    status: data.status
  }));

  const { error } = await attendanceService.upsertBulkAttendance(inputs, coachId);

  if (error) {
    console.error("Bulk attendance mark error", error);
    return { error: 'Lỗi ghi nhận điểm danh hàng loạt: ' + error.message };
  }


  revalidatePath(`/coach/classes/${data.scheduleId}`);
  return { success: true };
}

export async function adminManualCheckin(data: {
  scheduleId: string;
  coachId: string;
  notes?: string;
}) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Create a checkin record marked as valid
  const { error } = await supabase
    .from('staff_checkins')
    .insert({
      academy_id: academyId,
      schedule_id: data.scheduleId,
      coach_id: data.coachId,
      is_valid: true,
      notes: data.notes || 'Xác nhận thủ công bởi Admin (Hệ thống)'
    });

  if (error) {
    console.error('Admin Manual Checkin Error:', error);
    throw new Error('Lỗi khi chấm công hộ');
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function coachCancelClassSession(scheduleId: string, reason: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const coachMemberId = await getCoachMemberId(academyId);
  if (!coachMemberId) return { error: 'Tài khoản không thuộc trung tâm này' };

  const supabase = createAdminClient();
  const dateStr = getICTDateString();

  // Kiểm tra quyền (chỉ HLV trưởng mới được hủy)
  const { data: schedule } = await supabase
    .from('schedules')
    .select('class_id, classes(head_coach_id)')
    .eq('id', scheduleId)
    .single();

  if (!schedule || (schedule.classes as any)?.head_coach_id !== coachMemberId) {
    return { error: 'Chỉ HLV phụ trách lớp mới được quyền hủy ca học này' };
  }

  const { error } = await supabase
    .from('class_cancellations')
    .insert({
      schedule_id: scheduleId,
      date: dateStr,
      reason: reason,
      cancelled_by: coachMemberId,
      academy_id: academyId
    });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ca học này đã bị hủy từ trước' };
    }
    return { error: 'Lỗi khi hủy ca học' };
  }

  // [AUTO-REFUND] Hoàn buổi học cho các học viên đã bị lỡ điểm danh trước khi hủy
  const attendanceService = new AttendanceService(academyId);
  await attendanceService.handleCancelledSession(scheduleId, dateStr, coachMemberId);

  revalidatePath(`/coach/classes/${scheduleId}`);
  revalidatePath('/dashboard');
  return { success: true };
}
