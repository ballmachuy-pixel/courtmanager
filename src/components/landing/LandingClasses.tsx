import { createAdminClient } from '@/lib/supabase/service';
import { Star, Users, ShieldCheck } from 'lucide-react';

export default async function LandingClasses() {
  const supabase = createAdminClient();

  // 1. Get the academy ID for Sunday - Sunset
  const { data: academy } = await supabase
    .from('academies')
    .select('id')
    .ilike('name', '%Sunday%Sunset%')
    .limit(1)
    .maybeSingle();

  let displayedClasses: { name: string; desc: string; icon: any }[] = [];

  if (academy) {
    // 2. Fetch classes for this academy
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name, age_group, skill_level')
      .eq('academy_id', academy.id)
      .eq('is_active', true)
      .limit(6);
    
    if (classes && classes.length > 0) {
      displayedClasses = classes.map(c => ({
        name: c.name,
        desc: `${c.age_group || 'Mọi độ tuổi'} • ${c.skill_level || 'Cơ bản'}`,
        icon: Star // Default icon
      }));
    }
  }

  // Fallback if no classes found
  if (displayedClasses.length === 0) {
    displayedClasses = [
      { name: 'Lớp U7 (5-7 tuổi)', desc: 'Làm quen với bóng, phát triển vận động cơ bản.', icon: Star },
      { name: 'Lớp U10 (8-10 tuổi)', desc: 'Kỹ thuật dẫn bóng, ném rổ và phối hợp đồng đội.', icon: Users },
      { name: 'Lớp U13 (11-13 tuổi)', desc: 'Chiến thuật thi đấu và nâng cao thể lực chuyên sâu.', icon: ShieldCheck },
    ];
  }

  return (
    <section className="py-32 relative">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white uppercase italic">
            Các lớp đào tạo <span className="text-amber-500">Chuyên nghiệp</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Chúng tôi cung cấp các chương trình đào tạo phù hợp với từng độ tuổi và trình độ, giúp trẻ phát triển tối đa tiềm năng.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedClasses.map((c, idx) => (
            <div 
              key={`${c.name}-${idx}`} 
              className="glass-card p-10 group relative transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-8 border border-white/5 group-hover:border-indigo-500/30 group-hover:scale-110 transition-all duration-500 shadow-xl">
                <c.icon className="text-indigo-400 group-hover:text-indigo-300" size={28} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-indigo-300 transition-colors">
                {c.name}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                {c.desc}
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-indigo-400 font-black text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Xem chi tiết <Star size={14} fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}
