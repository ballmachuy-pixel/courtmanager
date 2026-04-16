import { ArrowRight, Info, Sparkles } from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative pt-44 pb-32 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl animate-in text-center mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 px-5 py-1.5 rounded-full text-[11px] font-black tracking-widest text-indigo-400 mb-8 uppercase">
            <Sparkles size={14} className="animate-spin-slow" />
             Học viện bóng rổ hàng đầu Thái Nguyên
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
            Nơi Khởi Đầu<br />
            <span className="bg-gradient-to-br from-indigo-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent italic px-2">
              Nhà Vô Địch
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Học viện Sunday - Sunset (Since 2020) dẫn đầu về đào tạo chuyên sâu, phát triển chiều cao và tư duy thi đấu bài bản cho trẻ em.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a 
              href="https://zalo.me/0392412022" 
              target="_blank" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 group"
            >
              <span className="text-2xl">💬</span>
              Đăng ký qua Zalo
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://www.facebook.com/sundaysunset22" 
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white px-10 py-5 rounded-2xl font-black transition-all hover:bg-slate-900 group"
            >
              <span className="text-2xl">🌍</span>
              Fanpage chính thức
            </a>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-50">
             {/* Thêm logo đối tác hoặc thông tin bổ trợ nếu có */}
          </div>
        </div>
      </div>
    </section>

  );
}
