import { Heart, Award, Trophy } from 'lucide-react';

const GOALS = [
  {
    icon: Heart,
    title: 'Phát triển thể chất',
    desc: 'Tập trung các bài tập bật nhảy, kéo giãn giúp kích thích tăng trưởng chiều cao tối đa cho trẻ.',
    color: 'var(--color-primary)'
  },
  {
    icon: Award,
    title: 'Kỹ năng chuyên môn',
    desc: 'Giáo trình bài bản từ cơ bản đến nâng cao, giúp trẻ làm chủ trái bóng và kỹ thuật thi đấu.',
    color: '#8b5cf6'
  },
  {
    icon: Trophy,
    title: 'Rèn luyện ý chí',
    desc: 'Xây dựng tinh thần đồng đội, kỷ luật và bản lĩnh vượt qua thử thách thông qua môn bóng rổ.',
    color: '#f59e0b'
  },
];

export default function LandingPhilosophy() {
  return (
    <section id="about" className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Triết lý <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">Sunday - Sunset</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            "Một dân tộc muốn khỏe phải bắt đầu từ trẻ em..."<br/>
            Chúng tôi tin rằng bóng rổ là chìa khóa để trẻ phát triển toàn diện cả về thể chất lẫn tinh thần.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {GOALS.map((g) => (
            <div 
              key={g.title} 
              className="glass-card group p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg" 
                style={{ background: `${g.color}15`, border: `1px solid ${g.color}30` }}
              >
                <g.icon size={32} style={{ color: g.color }} />
              </div>
              
              <h3 className="text-2xl font-black mb-5 tracking-tight">{g.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}
