import { Quote } from 'lucide-react';
import Image from 'next/image';

export default function LandingSocialProof() {
  return (
    <section className="py-20 bg-[#0f0f0f] relative overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-4 relative z-10">
        <p className="text-center text-white/40 text-sm font-bold uppercase tracking-widest mb-10">
          ĐƯỢC TIN DÙNG BỞI HƠN 50+ TRUNG TÂM & HỌC VIỆN
        </p>
        
        {/* Fake Logos for visual proof */}
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 mb-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-2xl font-black italic tracking-tighter">SUNSET<span className="text-pink-500">ACADEMY</span></div>
          <div className="text-2xl font-black tracking-widest uppercase">SSA<span className="text-purple-500 font-light">SPORTS</span></div>
          <div className="text-2xl font-bold font-mono">HOOP<span className="text-emerald-500">DREAMS</span></div>
          <div className="text-2xl font-black uppercase tracking-tight text-white/80">ELEVATE<span className="text-blue-500">BASKETBALL</span></div>
        </div>

        {/* Testimonial */}
        <div className="max-w-4xl mx-auto relative">
          <Quote size={60} className="absolute -top-8 -left-8 text-pink-500/20 rotate-180" />
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative z-10">
            <p className="text-xl md:text-3xl font-medium text-white/90 leading-relaxed mb-8 italic">
              "Từ ngày chuyển sang dùng CourtManager, trung tâm không còn tình trạng phụ huynh khiếu nại do tính nhầm buổi học. Hệ thống tự động báo hết hạn gói cước giúp doanh thu gia hạn tăng 30% ngay trong tháng đầu tiên."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center text-xl font-bold text-white">
                  H
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Anh Hưng (Founder)</h4>
                <p className="text-sm text-white/50">Giám đốc - Sunset Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
