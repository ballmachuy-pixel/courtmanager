import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="text-[120px] md:text-[180px] font-black text-white/5 leading-none select-none">404</div>
        <div className="-mt-16 md:-mt-24">
          <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-500/20">
            <Search size={28} className="text-pink-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3">Không tìm thấy trang</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-black text-sm inline-flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 active:scale-95"
          >
            <Home size={18} /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
