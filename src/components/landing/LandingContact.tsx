import Link from 'next/link';
import { Phone, MapPin, ShieldCheck, Users } from 'lucide-react';

export default function LandingContact() {
  return (
    <section className="py-32 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden shadow-2xl shadow-indigo-900/30">
          {/* Decorative element */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 blur-[80px] rounded-full" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter text-white">
                Sẵn Sàng Tham Gia<br/>
                <span className="text-amber-400">Đội Ngũ Của Chúng Tôi?</span>
              </h2>
              <p className="text-indigo-100/70 text-lg mb-10 max-w-md font-medium">
                Kết nối ngay với chúng tôi để nhận tư vấn về lộ trình phát triển tốt nhất cho con bạn.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-1">Hotline & Zalo</p>
                    <p className="font-black text-xl text-white">0392.41.2022 <span className="text-sm font-medium opacity-60">(Mr. Hưng)</span></p>
                  </div>
                </div>
                
                <a 
                  href="https://www.facebook.com/sundaysunset22" 
                  target="_blank" 
                  className="flex items-center gap-5 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mb-1">Facebook Fanpage</p>
                    <p className="font-black text-xl text-white group-hover:text-indigo-300 transition-colors">Sunday - Sunset Academy</p>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] text-slate-900 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-amber-400 text-slate-950 px-4 py-1 rounded-full font-black text-xs uppercase tracking-tighter">Hệ Thống Phối Hợp</div>
              
              <h3 className="text-2xl font-black mb-3 tracking-tight">Cổng Thông Tin Nội Bộ</h3>
              <p className="text-base text-slate-500 mb-10 font-medium">
                Dành riêng cho Phụ huynh & Huấn luyện viên Sunday - Sunset để theo dõi tiến độ học tập.
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/dang-nhap" 
                  className="flex items-center justify-center gap-3 bg-slate-950 text-white w-full py-5 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-950/20 group"
                >
                  <ShieldCheck size={22} className="text-amber-400 transition-transform group-hover:rotate-12" />
                  BIỂU ĐỒ QUẢN TRỊ
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-900 w-full py-5 rounded-2xl font-black transition-all border border-slate-200"
                >
                  <Users size={22} className="text-indigo-600" />
                  CỔNG HUẤN LUYỆN VIÊN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
}
