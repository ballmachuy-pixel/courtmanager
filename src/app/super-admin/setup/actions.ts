'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function bootstrapSuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return { error: 'Bạn phải đăng nhập trước khi thực hiện thiết lập.' };
  }

  const rootEmail = process.env.ROOT_ADMIN_EMAIL;
  if (!rootEmail || user.email !== rootEmail) {
    return { error: 'Tài khoản của bạn không có quyền khởi tạo hệ thống.' };
  }

  const adminClient = createAdminClient();

  // 1. Cập nhật user_metadata
  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, is_super_admin: true }
  });

  if (updateError) {
    console.error('Lỗi cập nhật metadata:', updateError);
    return { error: 'Không thể cập nhật metadata hệ thống.' };
  }

  // 2. Thêm vào bảng user_roles
  const { error: roleError } = await adminClient
    .from('user_roles')
    .upsert({
      user_id: user.id,
      role: 'super_admin'
    }, { onConflict: 'user_id,role' });

  if (roleError) {
    console.error('Lỗi thêm user_roles:', roleError);
    return { error: 'Không thể gán quyền trong database.' };
  }

  return { success: true };
}
