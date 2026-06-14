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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-in">
      {/* Icon with glow effect */}
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-30"></div>
        <div className="absolute inset-2 bg-red-500/20 rounded-full blur-md"></div>
        <AlertTriangle size={40} className="text-red-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Đã xảy ra lỗi hệ thống</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        Rất tiếc, hệ thống gặp sự cố khi tải trang. Sự cố này có thể do kết nối mạng yếu hoặc máy chủ đang xử lý quá nhiều dữ liệu. Vui lòng tải lại trang.
      </p>
      
      {/* Action button */}
      <button
        onClick={reset}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 active:scale-95 w-full sm:w-auto justify-center mb-8"
      >
        <RefreshCw size={18} /> Tải lại dữ liệu
      </button>

      {/* Error Details Card */}
      <div className="glass-card p-4 text-left w-full max-w-md border-red-500/10 bg-red-500/5">
         <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
           Chi tiết kỹ thuật
         </p>
         <div className="bg-black/40 rounded-xl p-3 border border-white/5 overflow-hidden">
            <p className="text-xs text-slate-300 font-mono break-words">
              {error.message || 'Unknown Error'}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 font-mono mt-2 pt-2 border-t border-white/5">
                Mã lỗi: {error.digest}
              </p>
            )}
         </div>
      </div>
    </div>
  );
}
