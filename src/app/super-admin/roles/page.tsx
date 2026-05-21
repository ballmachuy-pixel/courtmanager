import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { isSuperAdmin } from '@/lib/auth/impersonation';
import { redirect } from 'next/navigation';
import RoleManagementClient from './RoleManagementClient';

export default async function RoleManagementPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/dang-nhap');
  }

  const isSuper = await isSuperAdmin(user);
  if (!isSuper) {
    redirect('/dang-nhap');
  }

  // Lấy danh sách user_id từ user_roles
  const adminClient = createAdminClient();
  const { data: roles, error: rolesError } = await adminClient
    .from('user_roles')
    .select('user_id, granted_by, created_at')
    .eq('role', 'super_admin')
    .order('created_at', { ascending: true });

  const admins = [];
  
  if (roles) {
    for (const r of roles) {
      // Fetch user detail
      const { data: uData } = await adminClient.auth.admin.getUserById(r.user_id);
      if (uData?.user) {
        admins.push({
          id: uData.user.id,
          email: uData.user.email,
          created_at: r.created_at,
          granted_by: r.granted_by
        });
      }
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Quản Lý Quản Trị Viên</h1>
        <p className="text-neutral-400 mt-2">
          Thêm hoặc thu hồi quyền truy cập Tháp Điều Khiển. Mọi hành động đều được lưu vết hệ thống.
        </p>
      </div>

      <RoleManagementClient admins={admins} currentUserId={user.id} />
    </div>
  );
}
