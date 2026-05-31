'use server';

import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { StudentService } from '@/lib/services/student.service';
import { AssetService } from '@/lib/services/asset.service';
import { createAdminClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

/**
 * [DIAMOND v6] Create student with automated parent deduplication and class enrollment
 */
export async function createStudent(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const fullName = formData.get('full_name') as string;
  const parentName = formData.get('parent_name') as string;
  const phone = formData.get('phone') as string;
  const classId = formData.get('class_id') as string;

  if (!fullName || !parentName || !phone) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' };
  }

  try {
    const studentService = new StudentService(academyId);
    const assetService = new AssetService(academyId);

    // 1. Service Layer: Handle Parent Logic
    const { data: parentId, error: parentError } = await studentService.getOrCreateParent({
      fullName: parentName,
      phone: phone
    });
    if (parentError || !parentId) throw parentError || new Error('Lỗi xử lý thông tin phụ huynh');

    // 2. Asset Handling (Avatar)
    let avatarUrl = null;
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const fileName = `${academyId}/students/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { publicUrl, error: uploadError } = await assetService.uploadImage('avatars', fileName, avatarFile);
      if (uploadError) console.error('Avatar upload failed:', uploadError);
      avatarUrl = publicUrl;
    }

    // 3. Service Layer: Create Student & Enroll
    const { data: student, error: studentError } = await studentService.registerStudent(
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

    if (studentError || !student) throw studentError || new Error('Không thể tạo hồ sơ học viên');

    revalidatePath('/students');
    if (classId) revalidatePath(`/classes/${classId}`);
    
    return { success: true, id: student.id };
  } catch (error: any) {
    console.error('[DIAMOND ERROR] Create student failed:', error);
    return { error: error.message || 'Không thể tạo hồ sơ học viên' };
  }
}

/**
 * [DIAMOND v6] Update student profile with strict tenant boundary
 */
export async function updateStudent(studentId: string, formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  try {
    const studentService = new StudentService(academyId);
    const assetService = new AssetService(academyId);

    // 1. Service Layer: Handle Parent Update/Deduplication
    const { data: parentId, error: parentError } = await studentService.getOrCreateParent({
      fullName: formData.get('parent_name') as string,
      phone: formData.get('phone') as string
    });
    if (parentError || !parentId) throw parentError || new Error('Lỗi xử lý thông tin phụ huynh');

    // 2. Avatar Update
    // [NOTE] Using direct supabase for one-off check, or could move to StudentService
    const supabase = createAdminClient();
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
      const { publicUrl, error: uploadError } = await assetService.uploadImage('avatars', fileName, avatarFile);
      if (uploadError) throw uploadError;
      avatarUrl = publicUrl;
    }

    // 3. Service Layer: Update Profile
    const { error: updateError } = await studentService.updateStudentProfile(studentId, {
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

    if (updateError) throw updateError;

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

  try {
    const studentService = new StudentService(academyId);
    const assetService = new AssetService(academyId);

    const base64Data = base64Image.split(',')[1] || base64Image;
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${academyId}/${studentId}/${Date.now()}.jpg`;
    
    const { publicUrl, error: uploadError } = await assetService.uploadImage('avatars', fileName, buffer, { contentType: 'image/jpeg' });
    if (uploadError) throw uploadError;

    const { error: updateError } = await studentService.updateStudentProfile(studentId, { avatarUrl: publicUrl });
    if (updateError) throw updateError;

    revalidatePath(`/students/${studentId}`);
    return { success: true, avatarUrl: publicUrl };
  } catch (error: any) {
    console.error('[DIAMOND ERROR] Avatar upload failed:', error);
    throw new Error('Không thể tải ảnh lên: ' + error.message);
  }
}

export async function freezeStudentAction(data: {
  studentId: string;
  reason: string;
}) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  try {
    const studentService = new StudentService(academyId);
    
    // Lấy ID của User đang đăng nhập qua Supabase Auth để ghi log created_by
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await studentService.freezeStudent(data.studentId, data.reason, user?.id || academyId);
    
    if (error) throw error;

    revalidatePath(`/students/${data.studentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('[StudentAction] Freeze Error:', error);
    return { error: 'Không thể thay đổi trạng thái bảo lưu: ' + error.message };
  }
}
