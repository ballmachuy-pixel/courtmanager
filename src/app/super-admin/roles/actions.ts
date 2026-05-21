'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { verifySuperAdminAction } from '@/lib/auth/impersonation';
import { revalidatePath } from 'next/cache';

export async function addSuperAdmin(email: string) {
  // 1. Kiểm tra quyền của người đang gọi hàm
  const { user: currentUser, error: authError } = await verifySuperAdminAction();
  if (authError || !currentUser) {
    return { error: 'Bạn không có quyền thực hiện hành động này.' };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // 2. Tìm ID của user dựa trên email (sử dụng RPC)
  const { data: targetUserId, error: findError } = await supabase.rpc('get_user_id_by_email', {
    lookup_email: email
  });

  if (findError || !targetUserId) {
    return { error: 'Không tìm thấy tài khoản với email này trong hệ thống. Người dùng cần đăng nhập ít nhất 1 lần.' };
  }

  // 3. Thêm vào bảng user_roles
  const { error: insertError } = await adminClient
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role: 'super_admin',
      granted_by: currentUser.id
    });

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Người dùng này đã là Super Admin.' };
    }
    return { error: 'Lỗi khi cấp quyền vào Database.' };
  }

  // 4. Lấy metadata hiện tại và cập nhật
  const { data: targetUser, error: getUserError } = await adminClient.auth.admin.getUserById(targetUserId);
  if (!getUserError && targetUser?.user) {
    await adminClient.auth.admin.updateUserById(targetUserId, {
      user_metadata: { ...targetUser.user.user_metadata, is_super_admin: true }
    });
  }

  revalidatePath('/super-admin/roles');
  return { success: true };
}

export async function removeSuperAdmin(userIdToRemove: string) {
  // 1. Kiểm tra quyền
  const { user: currentUser, error: authError } = await verifySuperAdminAction();
  if (authError || !currentUser) {
    return { error: 'Bạn không có quyền thực hiện hành động này.' };
  }

  // 2. Kiểm tra an toàn: Không cho phép tự xóa chính mình
  if (currentUser.id === userIdToRemove) {
    return { error: 'Bạn không thể tự xóa quyền Super Admin của chính mình!' };
  }

  const adminClient = createAdminClient();

  // 3. Xóa khỏi bảng user_roles
  const { error: deleteError } = await adminClient
    .from('user_roles')
    .delete()
    .eq('user_id', userIdToRemove)
    .eq('role', 'super_admin');

  if (deleteError) {
    return { error: 'Lỗi khi thu hồi quyền từ Database.' };
  }

  // 4. Cập nhật metadata
  const { data: targetUser, error: getUserError } = await adminClient.auth.admin.getUserById(userIdToRemove);
  if (!getUserError && targetUser?.user) {
    await adminClient.auth.admin.updateUserById(userIdToRemove, {
      user_metadata: { ...targetUser.user.user_metadata, is_super_admin: false }
    });
  }

  revalidatePath('/super-admin/roles');
  return { success: true };
}
