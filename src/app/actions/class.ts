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
  const coachId = formData.get('coach_id') as string;

  if (!name) {
    throw new Error('Vui lòng điền tên lớp');
  }

  const { data: clazz, error } = await supabase
    .from('classes')
    .insert({
      academy_id: academyId,
      name,
      age_group: ageGroup || null,
      skill_level: skillLevel || null,
      max_students: isNaN(maxStudents) ? 20 : maxStudents,
      coach_id: coachId || null,
    })
    .select()
    .single();

  if (error || !clazz) {
    console.error('Create class error:', error);
    throw new Error('Không thể tạo lớp học');
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
  const coachId = formData.get('coach_id') as string;

  if (!name) {
    return { error: 'Vui lòng điền tên lớp' };
  }

  const { error } = await supabase
    .from('classes')
    .update({
      name,
      age_group: ageGroup || null,
      skill_level: skillLevel || null,
      max_students: isNaN(maxStudents) ? 20 : maxStudents,
      coach_id: coachId || null,
    })
    .eq('id', classId)
    .eq('academy_id', academyId);

  if (error) {
    console.error('Update class error:', error);
    return { error: 'Không thể cập nhật thông tin lớp học' };
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

  // Bundle GPS into location if provided: "Name | Lat, Lng"
  const location = coords ? `${locationName} | ${coords}` : locationName;

  if (dayOfWeekValues.length === 0) {
    throw new Error('Vui lòng chọn ít nhất một ngày trong tuần');
  }

  const inserts = dayOfWeekValues.map(day => ({
    class_id: classId,
    day_of_week: day,
    start_time: startTime,
    end_time: endTime,
    location: location || null
  }));

  const { error } = await supabase
    .from('schedules')
    .insert(inserts);

  if (error) {
    console.error('Add schedule error:', error);
    throw new Error('Không thể thêm lịch học');
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

  const location = coords ? `${locationName} | ${coords}` : locationName;

  if (dayOfWeekValues.length === 0) {
    throw new Error('Vui lòng chọn ít nhất một ngày');
  }

  // Update the primary schedule (the one that was clicked)
  const primaryDay = dayOfWeekValues[0];
  const { error } = await supabase
    .from('schedules')
    .update({
      day_of_week: primaryDay,
      start_time: startTime,
      end_time: endTime,
      location: location || null
    })
    .eq('id', scheduleId);

  if (error) {
    console.error('Update schedule error:', error);
    throw new Error('Không thể cập nhật lịch học');
  }

  // If more than one day was selected, create clones for the other days
  if (dayOfWeekValues.length > 1) {
    const extraDays = dayOfWeekValues.slice(1);
    const clones = extraDays.map(day => ({
      class_id: classId,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      location: location || null
    }));

    const { error: cloneError } = await supabase
      .from('schedules')
      .insert(clones);
      
    if (cloneError) {
      console.error('Clone schedule error:', cloneError);
    }
  }

  revalidatePath(`/classes/${classId}`);
  return { success: true };
}

export async function deleteSchedule(scheduleId: string, classId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');
  
  const supabase = createAdminClient();
  
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

