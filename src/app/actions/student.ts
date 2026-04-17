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

  // 1. Logic Deduplication: Tìm hoặc tạo Phụ huynh dựa trên Số điện thoại
  let parentId: string;
  
  const { data: existingParent, error: parentFetchError } = await supabase
    .from('parents')
    .select('id')
    .eq('academy_id', academyId)
    .eq('phone', phone)
    .single();

  if (existingParent) {
    parentId = existingParent.id;
    // Cập nhật tên nếu có thay đổi (optional: đồng bộ hóa tên phụ huynh)
    await supabase.from('parents').update({ full_name: parentName }).eq('id', parentId);
  } else {
    const { data: newParent, error: createParentError } = await supabase
      .from('parents')
      .insert({
        academy_id: academyId,
        full_name: parentName,
        phone: phone,
      })
      .select()
      .single();

    if (createParentError || !newParent) {
      return { error: 'Không thể tạo hồ sơ phụ huynh: ' + createParentError?.message };
    }
    parentId = newParent.id;
  }

  // 2. Xử lý Avatar
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
    }
  }

  // 3. Insert Student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      academy_id: academyId,
      parent_id: parentId, // FK mới
      parent_relationship: relationship, // Cột mới
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      skill_level: skillLevel,
      health_notes: healthNotes || null,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (studentError || !student) {
    console.error('Create student error:', studentError);
    return { error: studentError?.message || 'Không thể thêm học viên' };
  }

  revalidatePath('/students');
  return { success: true, id: student.id };
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

  // 1. Xử lý thông tin Phụ huynh (Deduplication / Update)
  let parentId: string;
  const { data: targetParent } = await supabase
    .from('parents')
    .select('id')
    .eq('academy_id', academyId)
    .eq('phone', phone)
    .single();

  if (targetParent) {
    parentId = targetParent.id;
    // Đồng bộ thông tin phụ huynh (tên)
    await supabase.from('parents').update({ full_name: parentName }).eq('id', parentId);
  } else {
    // Nếu SĐT thay đổi sang một số chưa tồn tại -> Tạo phụ huynh mới
    const { data: newParent } = await supabase
      .from('parents')
      .insert({ academy_id: academyId, full_name: parentName, phone: phone })
      .select().single();
    parentId = newParent?.id || '';
  }

  // 2. Xử lý Avatar
  const { data: oldStudent } = await supabase
    .from('students')
    .select('avatar_url')
    .eq('id', studentId)
    .single();

  let avatarUrl = oldStudent?.avatar_url;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `${academyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { data: uploadData } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
    if (uploadData) {
      avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
    }
  }

  // 3. Update Student
  const updateData: any = {
    full_name: fullName,
    parent_id: parentId,
    parent_relationship: relationship,
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
    return { error: studentError.message || 'Không thể cập nhật học viên' };
  }

  revalidatePath('/students');
  revalidatePath(`/students/${studentId}`);
  return { success: true };
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
