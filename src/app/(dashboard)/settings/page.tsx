import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { User, Settings, CheckCircle, MapPin, Shield, Building2, Phone, Mail } from 'lucide-react';
import LocationSettingsForm from '@/components/settings/LocationSettingsForm';
import UpdatePasswordForm from '@/components/settings/UpdatePasswordForm';

export default async function SettingsPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: academy } = await supabase
    .from('academies')
    .select('*')
    .eq('id', academyId)
    .single();
  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Cài Đặt</h1>
          <p className="text-slate-400 font-medium">Cấu hình thông tin trung tâm và quản lý nhân sự</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Academy Info Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
              <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <Building2 size={20} className="text-white" />
                </div>
                Thông tin chung
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Tên trung tâm</label>
                  <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-medium">{academy?.name || '—'}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5"><Phone size={10} /> Số điện thoại</label>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm">{academy?.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5"><MapPin size={10} /> Địa chỉ</label>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-300 text-sm truncate">{academy?.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                {/* Subscription Badge */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-emerald-400 uppercase tracking-wider">{academy?.subscription_tier?.toUpperCase() || 'FREE'}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Đang dùng thử miễn phí</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed" disabled>
                      Nâng cấp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Settings */}
          <LocationSettingsForm
            initialLat={academy?.latitude}
            initialLng={academy?.longitude}
            initialRadius={academy?.allowed_radius_m}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* Change Password Form */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
              <h2 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Shield size={20} className="text-white" />
                </div>
                Bảo mật tài khoản
              </h2>
              <UpdatePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
