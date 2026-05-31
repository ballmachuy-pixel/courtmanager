import Link from 'next/link';
import { Phone, ArrowRight } from 'lucide-react';

export default function LandingContact() {
  return (
    <section id="contact" className="py-32 bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-[#0a0a0a] rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden border border-white/10 shadow-2xl shadow-pink-900/20">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter text-white">
                Sẵn Sàng Nâng Tầm<br/>
                <span className="text-pink-400">Trung Tâm Của Bạn?</span>
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-md font-medium">
                Kết nối ngay với đội ngũ chuyên gia của chúng tôi để nhận tư vấn chuyển đổi số toàn diện cho học viện thể thao.
              </p>
              
              <div className="space-y-6">
                <a 
                  href="https://zalo.me/0355492420" 
                  target="_blank" 
                  className="flex items-center gap-5 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Hotline & Zalo Tư Vấn</p>
                    <p className="font-black text-xl text-white group-hover:text-pink-300 transition-colors">0355.492.420 <span className="text-sm font-medium opacity-60 text-white/50">(Mr. Huy)</span></p>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-black mb-4 text-white tracking-tight">Bắt đầu ngay hôm nay</h3>
              <p className="text-sm text-white/50 mb-8 font-medium">
                Khởi tạo không gian làm việc cho trung tâm của bạn chỉ trong 30 giây. Không yêu cầu thẻ tín dụng.
              </p>
              
              <Link 
                href="/dang-nhap" 
                className="flex items-center justify-center gap-3 bg-white text-[#0a0a0a] w-full py-5 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-white/10 group"
              >
                TẠO TÀI KHOẢN MIỄN PHÍ
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
