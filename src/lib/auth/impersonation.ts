/**
 * File này hiện tại chỉ dùng để nhận diện Super Admin.
 * (Tính năng Nhập vai đã bị gỡ bỏ để đảm bảo bảo mật)
 */

export async function isSuperAdmin(user: any): Promise<boolean> {
  const isRootOwner = user?.email && process.env.ROOT_ADMIN_EMAIL && user.email === process.env.ROOT_ADMIN_EMAIL;
  return isRootOwner || user?.app_metadata?.role === 'super_admin' || user?.user_metadata?.is_super_admin === true;
}
