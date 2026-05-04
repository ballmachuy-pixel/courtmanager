import { Suspense } from 'react';
import VIPList from './components/VIPList';
import ReportCenterClient from './components/ReportCenterClient';
import { Sparkles, Trophy, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ReportCenterPage() {
  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header section from client page moved here for server consistency if needed, 
          but ReportCenterClient has its own header. Let's keep it clean. */}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Export Tools */}
        <div className="lg:col-span-8">
          <ReportCenterClient />
        </div>

        {/* Right: VIP Ranking */}
        <div className="lg:col-span-4">
          <Suspense fallback={
            <div className="bg-slate-900/40 rounded-[2rem] p-8 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
              <p className="text-slate-500 text-sm font-medium">Đang tính toán bảng vàng...</p>
            </div>
          }>
            <VIPList />
          </Suspense>

          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles size={12} /> Gợi ý từ hệ thống
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Những học viên có số buổi học cao nhất thường là những ứng viên tiềm năng cho các lớp 1-kèm-1 hoặc các gói VIP chuyên sâu. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
