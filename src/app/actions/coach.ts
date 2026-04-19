'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getICTDateString, getICTStartOfDayUTC } from '@/lib/utils';
import { verifyCoachSession } from '@/lib/auth-utils';

// Haversine formula to calculate distance in meters between two lat/lng points
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Lấy ID thành viên của Coach từ phiên đăng nhập hiện tại
 */
async function getCoachMemberId(academyId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const coachToken = cookieStore.get('coach_session')?.value;
  const coachSession = coachToken ? await verifyCoachSession(coachToken) : null;
  
  const supabaseAdmin = createAdminClient();

  // 1. Identify coach via Supabase Auth (Admin Portal)
  if (user) {
    const { data: coachMember } = await supabaseAdmin
      .from('academy_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('academy_id', academyId)
      .single();
    
    if (coachMember) return coachMember.id;
  }

  // 2. Fallback: Identify coach via custom Coach Session (Coach Portal)
  if (coachSession) {
    const { data: coachMember } = await supabaseAdmin
      .from('academy_members')
      .select('id')
      .eq('id', coachSession.member_id)
      .eq('academy_id', academyId)
      .single();
    
    if (coachMember) return coachMember.id;
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

  const supabaseAdmin = createAdminClient();

  const { data: academy } = await supabaseAdmin
    .from('academies')
    .select('latitude, longitude, allowed_radius_m')
    .eq('id', data.academyId)
    .single();

  // [MỚI] CHỐNG TRÙNG LẶP: Kiểm tra xem đã có bản ghi check-in cho ca này trong hôm nay chưa
  const todayStart = getICTStartOfDayUTC();
  const { data: existingCheckin } = await supabaseAdmin
    .from('staff_checkins')
    .select('id')
    .eq('coach_id', coachMemberId)
    .eq('schedule_id', data.scheduleId || null)
    .gte('created_at', todayStart.toISOString())
    .single();

  if (existingCheckin) {
    return { success: true, alreadyExists: true };
  }

  // Try to find session-specific coordinates from the schedule
  let targetLat = academy?.latitude;
  let targetLng = academy?.longitude;
  
  // ... (rest of coordinates logic)
  if (data.scheduleId) {
    const { data: schedule } = await supabaseAdmin
      .from('schedules')
      .select('location')
      .eq('id', data.scheduleId)
      .single();
    
    if (schedule?.location?.includes('|')) {
      try {
        const parts = schedule.location.split('|');
        if (parts.length >= 2) {
          const coordsPart = parts[1].trim();
          if (coordsPart.includes(',')) {
            const [latStr, lngStr] = coordsPart.split(',');
            const parsedLat = parseFloat(latStr.trim());
            const parsedLng = parseFloat(lngStr.trim());
            
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
              targetLat = parsedLat;
              targetLng = parsedLng;
            }
          }
        }
      } catch (e) {
        console.error('Error parsing schedule GPS:', e);
      }
    }
  }

  let distance = null;
  let isValid = false;
  let finalNotes = data.notes || null;
  let warningMessage = null;

  if (data.latitude && data.longitude && targetLat && targetLng) {
    distance = calculateDistanceMeters(
      data.latitude, 
      data.longitude, 
      targetLat, 
      targetLng
    );
    const radius = academy?.allowed_radius_m || 300;
    isValid = distance <= radius;
    
    if (!isValid) {
      finalNotes = (finalNotes ? finalNotes + ' | ' : '') + `Ngoại phạm vi: Cảnh báo khoảng cách ${Math.round(distance)}m`;
      warningMessage = `Bạn đang cách sân ${Math.round(distance)}m (quá bán kính cho phép).`;
    }
  } else if (!data.latitude || !data.longitude) {
     isValid = false;
     finalNotes = (finalNotes ? finalNotes + ' | ' : '') + `Thiết bị không cung cấp GPS`;
     warningMessage = 'Không thể lấy thông tin GPS từ thiết bị.';
  } else if (!targetLat || !targetLng) {
     isValid = true;
     finalNotes = (finalNotes ? finalNotes + ' | ' : '') + `Chưa cấu hình tọa độ sân/trung tâm`;
  }

  if (!isValid && !data.forceSave) {
    return { 
      requiresExplanation: true, 
      warningMessage,
      distance: distance ? Math.round(distance) : null
    };
  }

  const { error: insertError } = await supabaseAdmin
    .from('staff_checkins')
    .insert({
      academy_id: data.academyId,
      schedule_id: data.scheduleId || null,
      coach_id: coachMemberId,
      latitude: data.latitude,
      longitude: data.longitude,
      distance_m: (typeof distance === 'number' && !isNaN(distance)) ? Math.round(distance) : null,
      is_valid: isValid,
      notes: finalNotes
    });

  if (insertError) {
    console.error('Checkin Error:', insertError);
    return { error: 'Lỗi ghi nhận check-in. Vui lòng thử lại hoặc báo Admin.' };
  }

  revalidatePath('/coach');
  revalidatePath('/dashboard');
  
  return { success: true, isValid, distance };
}


export async function overrideCheckin(checkinId: string) {
  const academyId = await getCurrentAcademyId();
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

  const coachId = await getCoachMemberId(academyId);

  // Upsert attendance dựa trên bộ 3 khóa Unique v2.0
  const { error } = await supabase
    .from('attendances')
    .upsert({
      academy_id: academyId,
      student_id: attendanceData.studentId,
      class_id: attendanceData.classId,
      schedule_id: attendanceData.scheduleId,
      date: dateStr,
      status: attendanceData.status,
      marked_by: coachId // Ghi nhận người thực hiện điểm danh
    }, { onConflict: 'student_id, schedule_id, date' });

  if (error) {
    console.error("Attendance mark error", error);
    return { error: 'Lỗi ghi nhận điểm danh: ' + error.message };
  }

  revalidatePath(`/coach/classes/${attendanceData.scheduleId}`);
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

  const coachId = await getCoachMemberId(academyId);

  const records = data.studentIds.map(studentId => ({
    academy_id: academyId,
    student_id: studentId,
    class_id: data.classId,
    schedule_id: data.scheduleId,
    date: dateStr,
    status: data.status,
    marked_by: coachId // Ghi nhận người thực hiện điểm danh hàng loạt
  }));

  const { error } = await supabase
    .from('attendances')
    .upsert(records, { onConflict: 'student_id, schedule_id, date' });

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
  const academyId = await getCurrentAcademyId();
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

