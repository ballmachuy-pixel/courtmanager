'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, User, Lock, ArrowRight, Loader2, Sparkles, 
  ChevronLeft, AlertCircle, ShieldCheck, Mail, CheckCircle, UserPlus
} from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function DangNhapPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    const supabase = createClient();
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không đúng');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Vui lòng xác nhận email của bạn trước khi đăng nhập.');
      } else {
        setError(authError.message);
      }
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleRegister = async () => {
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const supabase = createClient();
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Email này đã được đăng ký. Vui lòng đăng nhập.');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation is enabled
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra hộp thư email để xác nhận tài khoản.');
    } else if (data.session) {
      // Email confirmation is disabled — go straight to onboarding
      router.push('/onboarding');
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group pl-2">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại trang chủ</span>
        </Link>

        {/* Brand Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
               <Trophy size={32} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">CourtManager</h1>
            <p className="text-slate-400 text-sm">Quản lý học viện thể thao chuyên nghiệp</p>
          </div>

         {/* Removed Tab Switcher for strictly admin invites */}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm flex items-start gap-3 mb-6">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Thành công!</p>
                <p className="text-xs text-emerald-400/80">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-start gap-3 mb-6 animate-pulse">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Địa chỉ email"
                  required
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder={mode === 'register' ? 'Tạo mật khẩu (ít nhất 6 ký tự)' : 'Mật khẩu'}
                  required
                  minLength={6}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:from-indigo-500 hover:to-indigo-300 active:scale-95 transition-all shadow-xl shadow-indigo-600/25 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : mode === 'login' ? (
                    <>
                      <span>ĐĂNG NHẬP</span>
                      <ArrowRight size={20} />
                    </>
                  ) : (
                    <>
                      <span>TẠO TÀI KHOẢN</span>
                      <UserPlus size={20} />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                  className="text-sm font-bold text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {mode === 'login' ? 'Chưa có tài khoản? Đăng ký học viện mới' : 'Đã có tài khoản? Đăng nhập ngay'}
                </button>
              </div>
            </form>
          )}

          {success && (
            <button
              onClick={() => { setMode('login'); setSuccess(null); }}
              className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all mt-4"
            >
              <ArrowRight size={18} /> Chuyển sang Đăng nhập
            </button>
          )}

          <footer className="mt-10 pt-6 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
               <ShieldCheck size={12} />
               <span>CourtManager · Secure Authentication</span>
            </div>
          </footer>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400" />
            <span>Tự động tối ưu Android & iOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
