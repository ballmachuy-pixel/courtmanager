'use server';

import { isSuperAdmin } from '@/lib/auth/impersonation';
import { AcademyService } from '@/lib/services/super-admin/academy.service';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function verifySuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isSuperAdmin(user))) {
    throw new Error('Unauthorized: Super Admin access required');
  }
}



/**
 * Action để tạo học viện mới.
 */
export async function createAcademyAction(formData: FormData) {
  await verifySuperAdmin();
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  if (!name || !slug) throw new Error('Name and Slug are required');

  const service = new AcademyService();
  const ownerEmail = formData.get('ownerEmail') as string || '';
  const { data, error } = await service.createAcademy({ name, slug, ownerEmail });

  if (error) throw error;

  revalidatePath('/super-admin');
  return data;
}

/**
 * Action để thay đổi trạng thái khóa/mở khóa học viện.
 */
export async function toggleAcademyStatusAction(academyId: string, currentStatus: string, reason?: string) {
  await verifySuperAdmin();
  const service = new AcademyService();
  const { data, error } = await service.toggleAcademyStatus(academyId, currentStatus, reason);

  if (error) {
    console.error('Lỗi khi khóa/mở khóa học viện:', error);
    throw new Error('Lỗi cập nhật trạng thái học viện');
  }

  revalidatePath('/super-admin');
  return data;
}
