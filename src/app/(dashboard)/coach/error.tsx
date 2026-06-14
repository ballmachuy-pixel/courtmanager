'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('[Coach Dashboard Error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-50"></div>
        <AlertCircle size={40} className="text-red-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2">Đã có lỗi xảy ra!</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        Hệ thống không thể tải dữ liệu lịch học. Lỗi này có thể do kết nối mạng yếu hoặc máy chủ đang quá tải.
      </p>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
      >
        <RefreshCcw size={18} />
        Thử lại ngay
      </button>
      
      <div className="mt-8 px-4 py-3 bg-white/5 rounded-xl border border-white/5 max-w-sm w-full text-left">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Chi tiết lỗi kỹ thuật:</p>
        <p className="text-xs text-red-400/80 font-mono line-clamp-2">{error.message}</p>
      </div>
    </div>
  );
}
