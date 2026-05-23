import { createClient } from '@/lib/supabase/server';

/**
 * Kiểm tra xem user có quyền Super Admin hay không (dùng cho UI/Layout).
 * Dựa vào JWT metadata để tối ưu hiệu năng.
 * Lưu ý: Khi quyền thay đổi, user cần đăng xuất/đăng nhập lại để JWT cập nhật.
 */
export async function isSuperAdmin(user: any): Promise<boolean> {
  if (!user) return false;
  
  // Đặc cách cho email Root để họ có thể vào trang /super-admin/setup
  if (process.env.ROOT_ADMIN_EMAIL && user.email === process.env.ROOT_ADMIN_EMAIL) {
    return true;
  }

  return user?.user_metadata?.is_super_admin === true || user?.app_metadata?.role === 'super_admin';
}

/**
 * Kiểm tra xác thực Super Admin trực tiếp qua Database (dùng cho Server Actions).
 * Hàm này chống lại lỗi JWT Stale Data (khi Admin bị xóa quyền nhưng token vẫn còn hạn).
 */
export async function verifySuperAdminAction(): Promise<{ user: any, error: string | null }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, error: 'Unauthorized: Session invalid' };
  }

  // Đặc cách cho ROOT_ADMIN_EMAIL (tương tự như isSuperAdmin)
  if (process.env.ROOT_ADMIN_EMAIL && user.email === process.env.ROOT_ADMIN_EMAIL) {
    return { user, error: null };
  }

  // Live DB Check
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .maybeSingle();

  if (roleError || !roleData) {
    return { user: null, error: 'Forbidden: Requires Super Admin privileges' };
  }

  return { user, error: null };
}
