import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { Shield, Plus, Trash2, Power } from 'lucide-react';
import AddStaffForm from '@/components/settings/AddStaffForm';
import CheckinHistoryBoard from '@/components/staff/CheckinHistoryBoard';
import { deleteStaffMember } from '@/app/actions/settings';
import { createClient } from '@/lib/supabase/server';

export default async function StaffPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: staff } = await supabase
    .from('academy_members')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: checkinHistory } = await supabase
    .from('staff_checkins')
    .select('*, academy_members!staff_checkins_coach_id_fkey(display_name), schedules(classes(name))')
    .eq('academy_id', academyId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const supabaseSessionClient = await createClient();
  const { data: { user } } = await supabaseSessionClient.auth.getUser();
  const currentUserId = user?.id;

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Nhân sự</h1>
          <p className="text-slate-400 font-medium">Quản lý Cán bộ và Huấn luyện viên toàn trung tâm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Staff List */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8 min-h-[400px]">
              <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Shield size={20} className="text-white" />
                </div>
                Cán bộ & Huấn luyện viên
              </h2>

              {staff && staff.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {staff.map((s: any) => (
                    <div key={s.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-pink-500/20">
                          {s.display_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">{s.display_name}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {s.role === 'admin' ? 'Quản trị viên' : 'Huấn luyện viên'} • MÃ: {s.employee_code}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.is_active !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {s.is_active !== false ? 'Đang hoạt động' : 'Tạm nghỉ'}
                        </span>
                        
                        {/* Chỉ hiện nút Đổi trạng thái nếu đây KHÔNG phải là tài khoản Owner hiện tại */}
                        {(!s.user_id || s.user_id !== currentUserId) && s.is_active !== false && (
                          <form action={deleteStaffMember.bind(null, s.id)}>
                            <button 
                              type="submit" 
                              title="Xóa nhân sự"
                              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                            >
                              <Trash2 size={14} />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-sm">Chưa có nhân sự nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Add Form */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
              <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Plus size={20} className="text-white" />
                </div>
                Thêm nhân sự mới
              </h2>
              <AddStaffForm />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Checkin History */}
      <div className="mt-8">
        <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Shield className="text-white" size={20} />
          </div>
          Lịch sử Chấm công (30 ngày gần nhất)
        </h2>
        <CheckinHistoryBoard checkins={checkinHistory || []} />
      </div>
    </div>
  );
}
