import { Bell, BarChart3, Wallet } from 'lucide-react';

const TECH_FEATURES = [
  {
    icon: Bell,
    title: 'Điểm danh tức thì',
    desc: 'An tâm tuyệt đối với thông báo lịch học và điểm danh được gửi trực tiếp đến phụ huynh.',
    color: '#6366f1'
  },
  {
    icon: BarChart3,
    title: 'Báo cáo tiến độ',
    desc: 'Theo dõi sự tiến bộ của con qua biểu đồ kỹ năng Radar chuyên nghiệp và trực quan.',
    color: '#10b981'
  },
  {
    icon: Wallet,
    title: 'Ví buổi tập minh bạch',
    desc: 'Quản lý số dư buổi học và lịch sử đóng phí rõ ràng ngay trên điện thoại.',
    color: '#f59e0b'
  }
];

export default function LandingTech() {
  return (
    <section className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TECH_FEATURES.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group"
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon size={24} style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
