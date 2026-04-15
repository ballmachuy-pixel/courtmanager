'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-white mb-3">Đã xảy ra lỗi</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        Hệ thống gặp sự cố khi tải trang. Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp tục xuất hiện.
      </p>
      {error.digest && (
        <p className="text-[10px] text-slate-600 font-mono mb-4">Mã lỗi: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 active:scale-95"
      >
        <RefreshCw size={18} /> Tải lại trang
      </button>
    </div>
  );
}
