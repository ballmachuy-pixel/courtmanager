'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, User } from 'lucide-react';

export default function CoachLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Coach fields
  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');

  const handleCoachLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/coach-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_code: employeeCode.trim().toUpperCase(), pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Mã nhân viên hoặc PIN không đúng');
        setLoading(false);
        return;
      }

      // Navigate directly to the coach portal instead of admin dashboard wrapper
      // Bạo lực điều hướng không qua Next.js router để tránh xung đột state
      window.location.href = `/coach?t=${Date.now()}`;
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng kiểm tra lại kết nối mạng.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 animate-in">
        {/* Header section */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform rotate-3">
            <span className="text-4xl transform -rotate-3 block">🏀</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-6">Cổng Huấn Luyện</h1>
          <p className="text-slate-400 font-medium">Truy cập lịch dạy & điểm danh lớp học</p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
          
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mb-8 mx-auto w-fit flex justify-center">
             <User size={14} /> KHU VỰC DÀNH CHO HLV
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 mb-6 animate-pulse">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleCoachLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider pl-1">Mã HLV (ID)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Hash size={20} />
                </div>
                <input
                  id="login-employee-code"
                  type="text"
                  placeholder="VD: HLV001"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                  required
                  autoComplete="username"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black tracking-widest uppercase text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider pl-1">Mã PIN bảo mật</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="login-pin"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setPin(val);
                  }}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="current-password"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black tracking-[0.5em] text-2xl text-center"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 transition-all shadow-xl shadow-indigo-600/25 disabled:opacity-50 disabled:active:scale-100 mt-8 text-base"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <>VÀO SÂN TẬP <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>

        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            <ShieldCheck size={12} />
            <span>CourtManager · Coach Access</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
