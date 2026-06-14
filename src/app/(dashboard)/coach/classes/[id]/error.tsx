'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ClassDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Class Detail Error]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in">
      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-50"></div>
        <AlertTriangle size={40} className="text-amber-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2">Lỗi tải danh sách lớp</h2>
      <p className="text-slate-400 mb-8 max-w-sm text-sm">
        Không thể tải danh sách học viên của ca học này. Ca học có thể không tồn tại hoặc đã bị quản lý xóa.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-500/25 active:scale-95 transition-all w-full"
        >
          <RefreshCcw size={18} />
          Tải lại dữ liệu
        </button>

        <Link
          href="/coach"
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-2xl font-bold active:scale-95 transition-all w-full"
        >
          <ArrowLeft size={18} />
          Quay lại Lịch dạy
        </Link>
      </div>
      
      <div className="mt-8 px-4 py-3 bg-white/5 rounded-xl border border-white/5 max-w-sm w-full text-left">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Mã lỗi:</p>
        <p className="text-xs text-amber-400/80 font-mono line-clamp-2">{error.message}</p>
      </div>
    </div>
  );
}
