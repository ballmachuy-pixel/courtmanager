'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { StaffService } from '@/lib/services/staff.service';

export async function createQuickStaff(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const staffService = new StaffService(academyId);

  const name = formData.get('display_name') as string;
  const phone = formData.get('phone') as string;
  const role = (formData.get('role') as string) || 'coach';

  if (!name) return { error: 'Vui lòng điền tên nhân viên' };

  const { data: member, error } = await staffService.createStaff({
    displayName: name,
    phone,
    role
  });

  if (error) {
    console.error('Create staff error:', error);
    return { error: 'Không thể tạo tài khoản nhân viên' };
  }

  revalidatePath('/staff');
  return { success: true, member };
}
