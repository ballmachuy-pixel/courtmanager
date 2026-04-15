'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createStudent(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const fullName = formData.get('full_name') as string;
  const dateOfBirth = formData.get('date_of_birth') as string;
  const gender = formData.get('gender') as string;
  const skillLevel = (formData.get('skill_level') as string) || 'beginner';
  const healthNotes = formData.get('health_notes') as string;
  const avatarFile = formData.get('avatar') as File | null;

  const parentName = formData.get('parent_name') as string;
  const phone = formData.get('phone') as string;
  const relationship = (formData.get('relationship') as string) || 'mother';

  if (!fullName || !parentName || !phone) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' };
  }

  let avatarUrl = null;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `${academyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = publicUrlData.publicUrl;
    } else {
      console.error('Avatar upload failed:', uploadError);
    }
  }

  // 1. Insert Student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      academy_id: academyId,
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      skill_level: skillLevel,
      health_notes: healthNotes || null,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  // Use a mutable reference so retry can replace it safely
  let finalStudent = student;

  if (studentError || !finalStudent) {
    console.error('Create student error:', studentError);
    if (studentError?.code === 'PGRST204' || studentError?.message?.includes('avatar_url')) {
       // Graceful fallback if avatar_url column doesn't exist yet
       const { data: retryStudent, error: retryError } = await supabase
         .from('students')
         .insert({
           academy_id: academyId,
           full_name: fullName,
           date_of_birth: dateOfBirth || null,
           gender: gender || null,
           skill_level: skillLevel,
           health_notes: healthNotes || null,
         })
         .select()
         .single();
         
       if (retryError || !retryStudent) {
         return { error: retryError?.message || 'Không thể thêm học viên (Retry failed)' };
       }
       
       // Safely reassign to the retry result — original student was null
       finalStudent = retryStudent;
    } else {
       return { error: studentError?.message || 'Không thể thêm học viên' };
    }
  }

  // 2. Insert Parent Profile
  const { error: parentError } = await supabase
    .from('parent_profiles')
    .insert({
      student_id: finalStudent.id,
      parent_name: parentName,
      phone: phone,
      relationship: relationship,
    });

  if (parentError) {
    console.error('Create parent error:', parentError);
    // Vẫn redirect nhưng log lỗi (có thể handle tạo lại parent trong UI sau)
  }

  revalidatePath('/students');
  return { success: true, id: finalStudent.id };
}

export async function updateStudent(studentId: string, formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const fullName = formData.get('full_name') as string;
  const dateOfBirth = formData.get('date_of_birth') as string;
  const gender = formData.get('gender') as string;
  const skillLevel = (formData.get('skill_level') as string) || 'beginner';
  const healthNotes = formData.get('health_notes') as string;
  const avatarFile = formData.get('avatar') as File | null;

  const parentName = formData.get('parent_name') as string;
  const phone = formData.get('phone') as string;
  const relationship = (formData.get('relationship') as string) || 'mother';
  const isActiveStr = formData.get('is_active') as string;

  if (!fullName || !parentName || !phone) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' };
  }

  // Lấy dữ liệu học viên cũ để kiểm tra
  const { data: oldStudent } = await supabase
    .from('students')
    .select('avatar_url')
    .eq('id', studentId)
    .eq('academy_id', academyId)
    .single();

  if (!oldStudent) return { error: 'Không tìm thấy học viên' };

  let avatarUrl = oldStudent.avatar_url;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `${academyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Đảm bảo bucket 'avatars' được tạo trên Supabase và bật public
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = publicUrlData.publicUrl;
    } else {
      console.error('Avatar upload failed in update:', uploadError);
      // Tiếp tục lưu dù upload ảnh xịt
    }
  }

  // 1. Update Student
  const updateData: any = {
    full_name: fullName,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
    skill_level: skillLevel,
    health_notes: healthNotes || null,
    avatar_url: avatarUrl,
  };

  if (isActiveStr) {
    updateData.is_active = isActiveStr === 'true';
  }

  const { error: studentError } = await supabase
    .from('students')
    .update(updateData)
    .eq('id', studentId)
    .eq('academy_id', academyId);

  if (studentError) {
    console.error('Update student error:', studentError);
    return { error: studentError.message || 'Không thể cập nhật học viên' };
  }

  // 2. Update Parent Profile
  // Xem học viên đã có parent profile chưa
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('student_id', studentId)
    .single();

  if (parentProfile) {
    const { error: parentError } = await supabase
      .from('parent_profiles')
      .update({
        parent_name: parentName,
        phone: phone,
        relationship: relationship,
      })
      .eq('id', parentProfile.id);
      
    if (parentError) console.error('Update parent error:', parentError);
  } else {
    // Nếu chưa có thì tạo mới (phòng hờ dữ liệu cũ lỗi)
    const { error: parentError } = await supabase
      .from('parent_profiles')
      .insert({
        student_id: studentId,
        parent_name: parentName,
        phone: phone,
        relationship: relationship,
      });
      
    if (parentError) console.error('Create parent error during update:', parentError);
  }

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export async function deleteStudent(studentId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('academy_id', academyId);

  if (error) {
    console.error('Delete student error:', error);
    return { error: error.message || 'Không thể xóa học viên' };
  }

  revalidatePath('/students');
  return { success: true };
}
