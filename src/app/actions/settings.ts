'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function addStaff(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const displayName = formData.get('display_name') as string;
  const role = formData.get('role') as string;
  const employeeCode = formData.get('employee_code') as string;
  const pin = formData.get('pin') as string;

  if (!displayName || !role || !employeeCode || !pin) {
    throw new Error('Vui lòng điền đủ thông tin');
  }

  // Hash PIN
  const salt = await bcrypt.genSalt(10);
  const pinHash = await bcrypt.hash(pin, salt);

  const { error } = await supabase
    .from('academy_members')
    .insert({
      academy_id: academyId,
      display_name: displayName,
      role: role,
      employee_code: employeeCode,
      pin_hash: pinHash,
      must_change_pin: true, // Force coach to change PIN on first login
      is_active: true
    });

  if (error) {
    if (error.code === '23505') { // Unique violation
       throw new Error('Mã nhân viên này đã tồn tại trong trung tâm');
    }
    console.error('Add staff error:', error);
    throw new Error('Không thể thêm nhân sự');
  }

  revalidatePath('/settings');
  revalidatePath('/staff');
  return { success: true };
}

export async function deleteStaffMember(staffId: string, formData?: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Cố gắng Xóa vĩnh viễn (Hard Delete)
  const { error: deleteError } = await supabase
    .from('academy_members')
    .delete()
    .eq('id', staffId)
    .eq('academy_id', academyId);

  // Nếu gặp lỗi Khóa Ngoại (Foreign Key - 23503) do HLV này đã có dữ liệu Điểm danh/Lớp cũ
  if (deleteError && deleteError.code === '23503') {
    // Tự động lùi về phương án Vô hiệu hóa (Soft Delete)
    await supabase
      .from('academy_members')
      .update({ is_active: false })
      .eq('id', staffId)
      .eq('academy_id', academyId);
  } else if (deleteError) {
    console.error('Delete staff error:', deleteError);
    throw new Error('Lỗi không xác định khi vô hiệu hóa');
  }

  revalidatePath('/staff');
}
