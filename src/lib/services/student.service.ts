/**
 * StudentService — Core student & parent business logic.
 * Following Diamond Standard v3: Service Layer Separation & Multi-tenant security.
 */

import { createAdminClient } from '@/lib/supabase/service';

export interface StudentInput {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  skillLevel: string;
  healthNotes?: string;
  avatarUrl: string | null;
  parentRelationship: string;
}

export interface ParentInput {
  fullName: string;
  phone: string;
}

/**
 * Tìm hoặc tạo Phụ huynh dựa trên SĐT và academyId (Deduplication)
 */
export async function getOrCreateParent(academyId: string, input: ParentInput) {
  const supabase = createAdminClient();

  const { data: existingParent } = await supabase
    .from('parents')
    .select('id')
    .eq('academy_id', academyId)
    .eq('phone', input.phone)
    .single();

  if (existingParent) {
    // Cập nhật tên nếu có thay đổi
    await supabase
      .from('parents')
      .update({ full_name: input.fullName })
      .eq('id', existingParent.id)
      .eq('academy_id', academyId); // [SECURITY] Force academyId
    return existingParent.id;
  }

  const { data: newParent, error } = await supabase
    .from('parents')
    .insert({
      academy_id: academyId,
      full_name: input.fullName,
      phone: input.phone,
    })
    .select('id')
    .single();

  if (error || !newParent) throw new Error('Không thể tạo hồ sơ phụ huynh: ' + error?.message);
  return newParent.id;
}

/**
 * Xử lý tạo mới học viên kèm ghi danh
 */
export async function registerStudent(
  academyId: string,
  parentId: string,
  studentInput: StudentInput,
  classId?: string
) {
  const supabase = createAdminClient();

  // 1. Tạo học viên
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      academy_id: academyId,
      parent_id: parentId,
      parent_relationship: studentInput.parentRelationship,
      full_name: studentInput.fullName,
      date_of_birth: studentInput.dateOfBirth || null,
      gender: studentInput.gender || null,
      skill_level: studentInput.skillLevel,
      health_notes: studentInput.healthNotes || null,
      avatar_url: studentInput.avatarUrl,
    })
    .select()
    .single();

  if (studentError || !student) throw new Error(studentError?.message || 'Không thể thêm học viên');

  // 2. Ghi danh vào lớp (nếu có)
  if (classId) {
    await supabase
      .from('student_classes')
      .insert({
        student_id: student.id,
        class_id: classId
      });
  }

  return student;
}

/**
 * Cập nhật hồ sơ học viên với đầy đủ bảo mật
 */
export async function updateStudentProfile(
  academyId: string,
  studentId: string,
  updateData: Partial<StudentInput & { isActive: boolean; parentId: string }>
) {
  const supabase = createAdminClient();

  const dbData: any = {
    full_name: updateData.fullName,
    parent_id: updateData.parentId,
    parent_relationship: updateData.parentRelationship,
    date_of_birth: updateData.dateOfBirth,
    gender: updateData.gender,
    skill_level: updateData.skillLevel,
    health_notes: updateData.healthNotes,
    avatar_url: updateData.avatarUrl,
  };

  if (typeof updateData.isActive === 'boolean') {
    dbData.is_active = updateData.isActive;
  }

  const { error } = await supabase
    .from('students')
    .update(dbData)
    .eq('id', studentId)
    .eq('academy_id', academyId);

  if (error) throw new Error(error.message || 'Không thể cập nhật học viên');
  return { success: true };
}
