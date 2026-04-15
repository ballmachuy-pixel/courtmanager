'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Runtime error caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-in">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Error icon */}
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <AlertTriangle size={40} className="text-red-500" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white mb-4">
          Hệ thống gặp sự cố
        </h2>

        {/* Description */}
        <p className="text-slate-400 text-sm max-w-lg mb-4 leading-relaxed">
          Đã xảy ra lỗi không mong muốn. Hệ thống đang tự khôi phục — vui lòng thử tải lại trang hoặc quay về trang chủ.
        </p>

        {/* Error digest code */}
        {error.digest && (
          <p className="text-[10px] text-slate-600 font-mono mb-6 bg-slate-900/50 px-4 py-2 rounded-lg border border-white/5">
            Mã lỗi: {error.digest}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 active:scale-95"
          >
            <RefreshCw size={18} /> Tải lại trang
          </button>

          <a
            href="/dashboard"
            className="bg-white/5 hover:bg-white/10 text-slate-300 px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-3 transition-all border border-white/10 hover:border-white/20"
          >
            <Home size={18} /> Về Dashboard
          </a>
        </div>

        {/* Status footer */}
        <p className="text-[10px] text-slate-700 mt-12 uppercase tracking-widest font-bold">
          CourtManager • Auto-Recovery System
        </p>
      </div>
    </div>
  );
}
