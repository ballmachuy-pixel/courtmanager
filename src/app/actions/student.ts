'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import * as StudentService from '@/lib/services/student.service';

/**
 * [DIAMOND v3] Create student with automated parent deduplication and class enrollment
 */
export async function createStudent(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const fullName = formData.get('full_name') as string;
  const parentName = formData.get('parent_name') as string;
  const phone = formData.get('phone') as string;
  const classId = formData.get('class_id') as string;

  if (!fullName || !parentName || !phone) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' };
  }

  try {
    // 1. Service Layer: Handle Parent Logic
    const parentId = await StudentService.getOrCreateParent(academyId, {
      fullName: parentName,
      phone: phone
    });

    // 2. Asset Handling (Avatar)
    let avatarUrl = null;
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const fileName = `${academyId}/students/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadData) {
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      }
    }

    // 3. Service Layer: Create Student & Enroll
    const student = await StudentService.registerStudent(
      academyId,
      parentId,
      {
        fullName,
        dateOfBirth: formData.get('date_of_birth') as string,
        gender: formData.get('gender') as string,
        skillLevel: (formData.get('skill_level') as string) || 'beginner',
        healthNotes: formData.get('health_notes') as string,
        parentRelationship: (formData.get('relationship') as string) || 'mother',
        avatarUrl
      },
      classId
    );

    revalidatePath('/students');
    if (classId) revalidatePath(`/classes/${classId}`);
    
    return { success: true, id: student.id };
  } catch (error: any) {
    console.error('[DIAMOND ERROR] Create student failed:', error);
    return { error: error.message || 'Không thể tạo hồ sơ học viên' };
  }
}

/**
 * [DIAMOND v3] Update student profile with strict tenant boundary
 */
export async function updateStudent(studentId: string, formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  try {
    // 1. Service Layer: Handle Parent Update/Deduplication
    const parentId = await StudentService.getOrCreateParent(academyId, {
      fullName: formData.get('parent_name') as string,
      phone: formData.get('phone') as string
    });

    // 2. Avatar Update
    const { data: oldStudent } = await supabase
      .from('students')
      .select('avatar_url')
      .eq('id', studentId)
      .eq('academy_id', academyId)
      .single();

    let avatarUrl = oldStudent?.avatar_url;
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const fileName = `${academyId}/students/${Date.now()}.jpg`;
      const { data: uploadData } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
      if (uploadData) {
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      }
    }

    // 3. Service Layer: Update Profile
    await StudentService.updateStudentProfile(academyId, studentId, {
      parentId,
      fullName: formData.get('full_name') as string,
      dateOfBirth: formData.get('date_of_birth') as string,
      gender: formData.get('gender') as string,
      skillLevel: (formData.get('skill_level') as string) || 'beginner',
      healthNotes: formData.get('health_notes') as string,
      parentRelationship: (formData.get('relationship') as string) || 'mother',
      avatarUrl,
      isActive: formData.get('is_active') === 'true'
    });

    revalidatePath('/students');
    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[DIAMOND ERROR] Update student failed:', error);
    return { error: error.message || 'Không thể cập nhật hồ sơ' };
  }
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
    return { error: error.message || 'Không thể xóa học viên' };
  }

  revalidatePath('/students');
  return { success: true };
}

/**
 * Direct avatar upload (e.g. from camera)
 */
export async function updateStudentAvatar(studentId: string, base64Image: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  try {
    const base64Data = base64Image.split(',')[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${academyId}/${studentId}/${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const avatarUrl = publicUrlData.publicUrl;

    await StudentService.updateStudentProfile(academyId, studentId, { avatarUrl });

    revalidatePath(`/students/${studentId}`);
    return { success: true, avatarUrl };
  } catch (error: any) {
    console.error('[DIAMOND ERROR] Avatar upload failed:', error);
    throw new Error('Không thể tải ảnh lên: ' + error.message);
  }
}


