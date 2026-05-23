'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, ChevronLeft, AlertCircle, ShieldCheck, Loader2, Sparkles 
} from 'lucide-react';
import { AuthService } from '@/lib/services/auth.service';

export default function DangNhapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center"><Loader2 className="animate-spin text-white" size={32} /></div>}>
      <DangNhapContent />
    </Suspense>
  );
}

function DangNhapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lắng nghe lỗi từ URL
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'GoogleAuthFailed') {
      setError('Đăng nhập Google bị hủy hoặc gặp sự cố.');
    } else if (urlError === 'InvalidAuthData') {
      setError('Dữ liệu xác thực không hợp lệ. Vui lòng thử lại.');
    }

    if (urlError) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  // Clear any lingering coach session
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* LEFT SIDE: Image Background (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] overflow-hidden">
        <Image
          src="/images/login-bg.png"
          alt="CourtManager Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] opacity-90" />
        
        {/* Branding Overlay */}
        <div className="absolute bottom-12 left-12 z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Trophy size={24} className="text-white" />
            </div>
            <span className="text-white font-bold tracking-widest text-xl">COURTMANAGER</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Nền tảng quản trị Học viện Thể thao thông minh.
          </h2>
          <p className="text-white/60 text-lg">
            Khám phá sức mạnh của tự động hóa và quản lý tập trung trên một giao diện duy nhất.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Trở về trang chủ</span>
          </Link>

          <div className="mb-10 text-left">
            <h1 className="text-4xl font-bold text-white mb-3">Đăng nhập</h1>
            <p className="text-white/50 text-base">
              Chào mừng bạn quay trở lại. Hãy đăng nhập để truy cập vào hệ thống điều hành.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white text-[#3C4043] rounded-2xl py-4 font-bold flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100 group"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin text-slate-400" size={24} />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
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
            
            <p className="text-white/30 text-xs text-center mt-6 px-4">
              Bằng việc đăng nhập, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
            </p>
          </div>

          <footer className="mt-16 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
               <ShieldCheck size={14} className="text-emerald-500/70" />
               <span>Secured by Supabase Auth</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
