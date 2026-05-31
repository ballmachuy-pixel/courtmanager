import Link from 'next/link';
import { Trophy, ShieldCheck, Users, TrendingUp } from 'lucide-react';

export default function LandingFeatures() {
  const features = [
    {
      icon: <Users size={24} className="text-pink-400" />,
      title: "Theo dõi Học phí & Điểm danh",
      description: "Nhắc nhở học phí tự động, biết ngay bé nào sắp hết buổi. Phụ huynh yên tâm, trung tâm không lo thất thoát."
    },
    {
      icon: <ShieldCheck size={24} className="text-purple-400" />,
      title: "Tính lương HLV tự động",
      description: "HLV đến sân điện thoại tự động check-in GPS. Cuối tháng phần mềm tự cộng lương chính xác đến từng ca dạy."
    },
    {
      icon: <TrendingUp size={24} className="text-amber-400" />,
      title: "Sổ quỹ & Biểu đồ Doanh thu",
      description: "Biết chính xác hôm nay thu được bao nhiêu tiền, chi bao nhiêu khoản chỉ với 1 thao tác trên điện thoại."
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-pink-500/20">
            <Trophy size={14} /> Tự động hóa vận hành
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight">
            Tập trung vào <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Giảng dạy</span>, việc còn lại để CourtManager lo.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group hover:-translate-y-1 shadow-xl shadow-black/50">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
