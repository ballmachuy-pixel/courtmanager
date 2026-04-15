'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Building2, Save, Loader2, Dumbbell, MapPin, Phone, Sparkles, Rocket } from 'lucide-react';
import { SPORT_TYPES } from '@/lib/constants';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('basketball');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/dang-nhap');
        return;
      }

      setUserId(session.user.id);

      const { data: academy } = await supabase
        .from('academies')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (academy) {
        router.push('/dashboard');
        return;
      }

      setChecking(false);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { data: academy, error: academyError } = await supabase
        .from('academies')
        .insert({
          name,
          sport_type: sportType,
          phone,
          address,
          owner_id: userId,
          subscription_tier: 'free',
        })
        .select()
        .single();

      if (academyError) throw academyError;

      const { error: memberError } = await supabase
        .from('academy_members')
        .insert({
          academy_id: academy.id,
          user_id: userId,
          role: 'owner',
          employee_code: 'ADMIN',
          display_name: 'Quản trị viên',
          must_change_pin: false,
        });

      if (memberError) throw memberError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      console.error('Onboarding err:', err);
      setError('Đã có lỗi xảy ra: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative">
          <div className="flex-1 text-center mt-4">
            <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-pink-500/20">
              <Sparkles size={12} /> Chào mừng bạn đến CourtManager
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
              Khởi tạo Trung tâm 🚀
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              Chỉ cần vài phút để bắt đầu quản lý chuyên nghiệp hơn.
            </p>
          </div>
          <button 
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push('/dang-nhap');
            }}
            className="absolute top-0 right-0 text-xs text-slate-500 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg z-50"
          >
            Đăng xuất
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl shadow-black/40">
            <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8 space-y-5">
              {/* Name */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 size={10} /> Tên Trung tâm / CLB *
                </label>
                <input
                  type="text"
                  placeholder="VD: Học viện Bóng rổ ABC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
                />
              </div>

              {/* Sport */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Dumbbell size={10} /> Môn thể thao chính *
                </label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium"
                >
                  {SPORT_TYPES.map(sport => (
                    <option key={sport.value} value={sport.value} className="bg-slate-900 text-white">
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone size={10} /> Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin size={10} /> Địa chỉ
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-2xl shadow-pink-600/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Rocket size={20} /> Hoàn tất và Bắt đầu</>}
          </button>
        </form>
      </div>
    </div>
  );
}
