/* eslint-disable @next/next/no-img-element */
import { getCurrentAcademyId } from '@/lib/server-utils';
import { AcademyService } from '@/lib/services/academy.service';
import { updateAcademyProfileAction } from '@/app/actions/academy';
import { redirect } from 'next/navigation';
import { verifyCoachSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import LocationManager from '@/components/settings/LocationManager';

export default async function SettingsPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  // RBAC: Chỉ Admin/Owner của học viện mới được truy cập
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  
  let isAuthorized = false;
  
  if (token) {
    const session = await verifyCoachSession(token);
    if (session && ['admin', 'owner'].includes(session.role)) {
      isAuthorized = true;
    }
  }

  // Nếu chưa authorized qua coach_session, kiểm tra xem có phải là Owner qua Supabase Auth không
  if (!isAuthorized) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Dùng admin client để bypass RLS nếu cần, hoặc dùng anon client nếu RLS đã mở
      const { createAdminClient } = await import('@/lib/supabase/service');
      const adminSupabase = createAdminClient();
      
      const { data: academy } = await adminSupabase
        .from('academies')
        .select('id')
        .eq('id', academyId)
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (academy) isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Truy cập bị từ chối</h2>
          <p className="mt-2 text-white/40">Bạn không có quyền quản trị để thay đổi cài đặt của trung tâm.</p>
        </div>
      </div>
    );
  }

  const academyService = new AcademyService(academyId);
  const { data: academy } = await academyService.getProfile();
  const { data: locations } = await academyService.getLocations();

  if (!academy) return <div>Không tìm thấy thông tin học viện.</div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt học viện</h1>
        <p className="text-white/50 mt-1">Cấu hình thông tin thương hiệu và vận hành của trung tâm.</p>
      </div>

      <form action={updateAcademyProfileAction as any} className="space-y-6">
        <input type="hidden" name="current_logo_url" value={academy.logo_url || ''} />
        
        <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-8 space-y-6">
          <div className="flex items-center gap-8 border-b border-white/5 pb-8">
            <div className="group relative h-24 w-24 overflow-hidden rounded-2xl bg-white/5 transition-all hover:bg-white/10">
              {academy.logo_url ? (
                <img src={academy.logo_url} className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🏀</div>
              )}
              <input 
                type="file" 
                name="logo" 
                className="absolute inset-0 cursor-pointer opacity-0" 
                accept="image/*"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold">Logo học viện</h3>
              <p className="text-sm text-white/40">Sử dụng định dạng JPG hoặc PNG. Tối đa 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">Tên học viện</label>
              <input
                name="name"
                defaultValue={academy.name}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
                placeholder="VD: CourtManager Academy"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60">Slug (Đường dẫn)</label>
              <input
                name="slug"
                defaultValue={academy.slug}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
                placeholder="vd: courtmanager-academy"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-purple-600 px-8 py-4 font-bold text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            Lưu thông tin cơ bản
          </button>
        </div>
      </form>

      <div className="border-t border-white/5 pt-12">
        <LocationManager initialLocations={locations || []} />
      </div>
    </div>
  );
}
