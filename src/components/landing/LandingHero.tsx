import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-500/20 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-xs font-bold tracking-widest mb-8 backdrop-blur-md">
          <Zap size={14} className="text-amber-400" /> SẴN SÀNG CHO KỶ NGUYÊN SỐ
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-8 max-w-5xl mx-auto">
          Nền tảng Quản trị <br className="hidden md:block"/>
          Học viện Thể thao <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Toàn diện</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium">
          Giải pháp SaaS 4.0 dành riêng cho các trung tâm đào tạo. Tự động hóa CRM, chấm công HLV qua GPS, và kiểm soát tài chính chuẩn xác 100%.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            href="/dang-nhap" 
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-pink-600/30 group"
          >
            Bắt đầu sử dụng miễn phí
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="#features" 
            className="w-full sm:w-auto flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/10"
          >
            Khám phá tính năng
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm font-bold text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500/70"/> Bảo mật dữ liệu</div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-500/70"/> Hỗ trợ đa cơ sở</div>
        </div>
      </div>
    </section>
  );
}
