'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

export async function createQuickStaff(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = createAdminClient();

  const name = formData.get('display_name') as string;
  const phone = formData.get('phone') as string;
  const role = (formData.get('role') as string) || 'coach';

  if (!name) {
    return { error: 'Vui lòng điền tên nhân viên' };
  }

  const { data: member, error } = await supabase
    .from('academy_members')
    .insert({
      academy_id: academyId,
      display_name: name,
      phone: phone || null,
      role: role,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Create staff error:', error);
    return { error: 'Không thể tạo tài khoản nhân viên' };
  }

  revalidatePath('/staff');
  return { success: true, member };
}
