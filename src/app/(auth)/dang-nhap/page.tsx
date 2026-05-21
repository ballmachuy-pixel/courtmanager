'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { CoachSession } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, User, Lock, ArrowRight, Loader2, Sparkles, 
  ChevronLeft, AlertCircle, ShieldCheck, Mail, CheckCircle, UserPlus
} from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';

export default function DangNhapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
      <DangNhapContent />
    </Suspense>
  );
}

function DangNhapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Lắng nghe lỗi từ URL
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'GoogleAuthFailed') {
      setError('Đăng nhập Google bị hủy hoặc gặp sự cố.');
    } else if (urlError === 'InvalidAuthData') {
      setError('Dữ liệu xác thực không hợp lệ. Vui lòng thử lại.');
    }

    // Xóa lỗi khỏi URL để tránh bị lặp lại khi refresh trang
    if (urlError) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  // Clear any lingering coach session when visiting the Admin login page
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    // Giữ lại tham số next nếu có (để redirect đúng trang đích)
    const nextPath = searchParams.get('next');
    const redirectUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (nextPath) redirectUrl.searchParams.set('next', nextPath);

    try {
      await AuthService.signInWithGoogle(redirectUrl.toString());
    } catch (error: any) {
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

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
            <>
              {/* Nút Đăng nhập Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || isGoogleLoading}
                className="w-full bg-white text-[#3C4043] rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100 border border-slate-200"
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin text-slate-400" size={24} />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.369 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    <span>Tiếp tục với Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">HOẶC ĐĂNG NHẬP BẰNG EMAIL</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

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
                  placeholder="Mật khẩu"
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
            </form>
          </>
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

        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-indigo-400 transition-colors hover:underline underline-offset-4 flex items-center gap-2">
            <Trophy size={14} /> Bạn là Huấn luyện viên? Đi tới cổng dành riêng
          </Link>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400" />
            <span>Tự động tối ưu Android & iOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
