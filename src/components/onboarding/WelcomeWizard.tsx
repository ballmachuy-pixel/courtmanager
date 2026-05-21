'use client';
import { Building2 } from 'lucide-react';
import CreateAcademyForm from '@/components/super-admin/CreateAcademyForm';

export default function WelcomeWizard() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 transform -rotate-3">
            <Building2 size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-3">Chào mừng đến với CourtManager!</h2>
          <p className="text-white/60">Hệ thống chưa có Học viện nào. Hãy khởi tạo không gian làm việc đầu tiên của bạn để bắt đầu sử dụng các tính năng.</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-10">
             <div className="flex items-center gap-2 text-purple-400 font-bold">
               <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">1</div>
               <span className="text-sm md:text-base">Tạo Học Viện</span>
             </div>
             <div className="w-8 md:w-12 h-px bg-white/10"></div>
             <div className="flex items-center gap-2 text-white/40 font-bold">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">2</div>
               <span className="text-sm md:text-base">Thêm Cơ Sở</span>
             </div>
             <div className="w-8 md:w-12 h-px bg-white/10"></div>
             <div className="flex items-center gap-2 text-white/40 font-bold">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">3</div>
               <span className="text-sm md:text-base">Mời HLV</span>
             </div>
          </div>

          <div className="bg-white/5 border border-dashed border-white/20 p-8 rounded-2xl flex flex-col items-center justify-center gap-4">
             <p className="text-sm text-white/50 text-center">Nhấp vào nút bên dưới để điền thông tin Học viện đầu tiên của bạn.</p>
             <CreateAcademyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
