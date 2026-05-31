import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-500/20 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-xs font-bold tracking-widest mb-8 backdrop-blur-md">
          <TrendingUp size={14} className="text-emerald-400" /> GIẢI PHÁP TĂNG DOANH THU & CHỐNG THẤT THOÁT
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-8 max-w-5xl mx-auto">
          Dừng quản lý trung tâm bằng <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Sổ sách & Cảm tính</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium">
          Chấm dứt ngay tình trạng sót học phí, HLV chấm công hộ, và đau đầu xếp lịch. CourtManager tự động hóa mọi thứ để bạn tập trung vào chất lượng đào tạo.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            href="#contact" 
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 shadow-2xl shadow-pink-600/30 group"
          >
            Đăng ký nhận Tư vấn
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="#features" 
            className="w-full sm:w-auto flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/10"
          >
            Khám phá tính năng
          </a>
        </div>

        {/* Dashboard Mockup Image */}
        <div className="relative max-w-5xl mx-auto mt-12 mb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-black/50 backdrop-blur-sm p-2">
            <Image 
              src="/images/dashboard-mockup.png" 
              alt="CourtManager Dashboard Mockup" 
              width={1200} 
              height={800} 
              className="rounded-xl object-cover w-full opacity-90 hover:opacity-100 transition-opacity"
              priority
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm font-bold text-white/30 uppercase tracking-widest relative z-20 mt-8">
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500/70"/> Bảo mật dữ liệu</div>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-500/70"/> Quản lý Đa cơ sở</div>
        </div>
      </div>
    </section>
  );
}
