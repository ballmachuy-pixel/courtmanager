'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createClass(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const ageGroup = formData.get('age_group') as string;
  const skillLevel = formData.get('skill_level') as string;
  const maxStudents = parseInt(formData.get('max_students') as string, 10);
  // [MỚI] Lấy danh sách nhiều HLV
  const coachIds = formData.getAll('coach_ids').map(id => id as string);

  if (!name) {
    throw new Error('Vui lòng điền tên lớp');
  }

  // Head Coach (legacy compatibility - take first coach or null)
  const primaryCoachId = coachIds.length > 0 ? coachIds[0] : null;

  const { data: clazz, error } = await supabase
    .from('classes')
    .insert({
      academy_id: academyId,
      name,
      age_group: ageGroup || null,
      skill_level: skillLevel || null,
      max_students: isNaN(maxStudents) ? 20 : maxStudents,
      head_coach_id: primaryCoachId,
    })
    .select()
    .single();

  if (error || !clazz) {
    console.error('Create class error:', error);
    throw new Error('Không thể tạo lớp học');
  }

  // [MỚI] Lưu danh sách HLV mặc định của lớp
  if (coachIds.length > 0) {
    const classCoaches = coachIds.map(id => ({
      class_id: clazz.id,
      coach_id: id
    }));
    await supabase.from('class_default_coaches').insert(classCoaches);
  }

  revalidatePath('/classes');
  redirect('/classes');
}

export async function updateClass(classId: string, formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const ageGroup = formData.get('age_group') as string;
  const skillLevel = formData.get('skill_level') as string;
  const maxStudents = parseInt(formData.get('max_students') as string, 10);
  // [MỚI] Lấy danh sách nhiều HLV
  const coachIds = formData.getAll('coach_ids').map(id => id as string);

  if (!name) {
    return { error: 'Vui lòng điền tên lớp' };
  }

  const primaryCoachId = coachIds.length > 0 ? coachIds[0] : null;

  const { error } = await supabase
    .from('classes')
    .update({
      name,
      age_group: ageGroup || null,
      skill_level: skillLevel || null,
      max_students: isNaN(maxStudents) ? 20 : maxStudents,
      head_coach_id: primaryCoachId,
    })
    .eq('id', classId)
    .eq('academy_id', academyId);

  if (error) {
    console.error('Update class error:', error);
    return { error: 'Không thể cập nhật thông tin lớp học' };
  }

  // [MỚI] Cập nhật Mapping HLV mặc định (Xóa sạch tạo lại cho đơn giản)
  await supabase.from('class_default_coaches').delete().eq('class_id', classId);
  if (coachIds.length > 0) {
    const classCoaches = coachIds.map(id => ({
      class_id: classId,
      coach_id: id
    }));
    await supabase.from('class_default_coaches').insert(classCoaches);
  }

  revalidatePath(`/classes/${classId}`);
  revalidatePath('/classes');
  return { success: true };
}

export async function enrollStudent(studentId: string, classId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('student_classes')
    .insert({
      student_id: studentId,
      class_id: classId
    });

  if (error) {
    if (error.code === '23505') throw new Error('Học viên đã ở trong lớp này rồi');
    throw new Error('Không thể thêm học viên vào lớp');
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}

export async function enrollStudents(studentIds: string[], classId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  if (!studentIds.length) return { success: true };

  const supabase = createAdminClient();

  const inserts = studentIds.map(id => ({
    student_id: id,
    class_id: classId
  }));

  const { error } = await supabase
    .from('student_classes')
    .insert(inserts);

  if (error) {
    if (error.code === '23505') {
       // If some are already enrolled, we might want to use upsert or ignore, but insert will fail everything.
       // The best way in Supabase to ignore conflicts is upsert with ON CONFLICT DO NOTHING,
       // but we don't have constraints manually set in RPC here.
       throw new Error('Một số học viên đã ở trong lớp này rồi');
    }
    throw new Error('Không thể thêm học viên vào lớp');
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}

export async function addSchedule(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const classId = formData.get('class_id') as string;
  const dayOfWeekValues = formData.getAll('day_of_week').map(v => parseInt(v as string, 10));
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const locationName = formData.get('location') as string;
  const coords = formData.get('coords') as string;
  // [MỚI] Lấy danh sách nhiều HLV cho lịch này
  const coachIds = formData.getAll('coach_ids').map(id => id as string);

  // Bundle GPS into location if provided: "Name | Lat, Lng"
  const location = coords ? `${locationName} | ${coords}` : locationName;

  if (dayOfWeekValues.length === 0) {
    throw new Error('Vui lòng chọn ít nhất một ngày trong tuần');
  }

  // [SEC] Firewall: Verify class ownership
  const { data: belongs, error: belongsError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('academy_id', academyId)
    .single();

  if (belongsError || !belongs) {
    throw new Error('Bạn không có quyền can thiệp vào lớp học này');
  }

  const primaryCoachId = coachIds.length > 0 ? coachIds[0] : null;

  const inserts = dayOfWeekValues.map(day => ({
    class_id: classId,
    day_of_week: day,
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    assigned_coach_id: primaryCoachId
  }));

  const { data: newSchedules, error } = await supabase
    .from('schedules')
    .insert(inserts)
    .select('id');

  if (error || !newSchedules) {
    console.error('Add schedule error:', error);
    throw new Error('Không thể thêm lịch học');
  }

  // [MỚI] Lưu Mapping HLV cho từng ca học vừa tạo
  if (coachIds.length > 0) {
    const coachMappings = newSchedules.flatMap(s => 
      coachIds.map(coachId => ({
        schedule_id: s.id,
        coach_id: coachId
      }))
    );
    await supabase.from('schedule_coaches').insert(coachMappings);
  }

  revalidatePath(`/classes/${classId}`);
}

export async function updateSingleSchedule(scheduleId: string, classId: string, formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');
  
  const supabase = createAdminClient();
  
  const dayOfWeekValues = formData.getAll('day_of_week').map(v => parseInt(v as string, 10));
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const locationName = formData.get('location') as string;
  const coords = formData.get('coords') as string;
  // [MỚI] Lấy danh sách nhiều HLV cho lịch này
  const coachIds = formData.getAll('coach_ids').map(id => id as string);

  const location = coords ? `${locationName} | ${coords}` : locationName;

  if (dayOfWeekValues.length === 0) {
    throw new Error('Vui lòng chọn ít nhất một ngày');
  }

  // [SEC] Firewall: Verify class ownership
  const { data: belongs } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('academy_id', academyId)
    .single();

  if (!belongs) {
    throw new Error('Bạn không có quyền can thiệp vào lớp học này');
  }

  // Update the primary schedule (the one that was clicked)
  const primaryDay = dayOfWeekValues[0];
  const primaryCoachId = coachIds.length > 0 ? coachIds[0] : null;

  const { error } = await supabase
    .from('schedules')
    .update({
      day_of_week: primaryDay,
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      assigned_coach_id: primaryCoachId
    })
    .eq('id', scheduleId);

  if (error) {
    console.error('Update schedule error:', error);
    throw new Error('Không thể cập nhật lịch học');
  }

  // [MỚI] Cập nhật Mapping HLV cho ca học này (Xóa sạch tạo lại)
  await supabase.from('schedule_coaches').delete().eq('schedule_id', scheduleId);
  if (coachIds.length > 0) {
    const coachMappings = coachIds.map(coachId => ({
      schedule_id: scheduleId,
      coach_id: coachId
    }));
    await supabase.from('schedule_coaches').insert(coachMappings);
  }

  // If more than one day was selected, create clones for the other days
  if (dayOfWeekValues.length > 1) {
    const extraDays = dayOfWeekValues.slice(1);
    const clones = extraDays.map(day => ({
      class_id: classId,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      assigned_coach_id: primaryCoachId
    }));

    const { data: newClones, error: cloneError } = await supabase
      .from('schedules')
      .insert(clones)
      .select('id');
      
    if (cloneError) {
      console.error('Clone schedule error:', cloneError);
    } else if (newClones && coachIds.length > 0) {
      // Sync mapping for clones too
      const cloneMappings = newClones.flatMap(s => 
        coachIds.map(coachId => ({
          schedule_id: s.id,
          coach_id: coachId
        }))
      );
      await supabase.from('schedule_coaches').insert(cloneMappings);
    }
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}

export async function deleteSchedule(scheduleId: string, classId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');
  
  const supabase = createAdminClient();
  
  // [SEC] Firewall: Verify class ownership
  const { data: belongs } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('academy_id', academyId)
    .single();

  if (!belongs) {
    throw new Error('Bạn không có quyền can thiệp vào lớp học này');
  }
  
  // Try Hard Delete first
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error && error.code === '23503') {
    // If Foreign Key Violation (e.g. Schedule already has staff_checkins), fallback to Soft Delete
    const { error: softDeleteError } = await supabase
      .from('schedules')
      .update({ is_active: false })
      .eq('id', scheduleId);
      
    if (softDeleteError) {
      console.error('Soft delete schedule error:', softDeleteError);
      throw new Error('Lỗi hệ thống khi tạm khóa lịch học');
    }
  } else if (error) {
    console.error('Delete schedule error:', error);
    throw new Error('Không thể xóa lịch học');
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}

export async function getCoaches() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return [];

  const supabase = createAdminClient();
  
  const { data } = await supabase
    .from('academy_members')
    .select('id, display_name, role')
    .eq('academy_id', academyId)
    .in('role', ['coach', 'admin', 'owner'])
    .neq('is_active', false)
    .order('display_name');

  return data || [];
}

