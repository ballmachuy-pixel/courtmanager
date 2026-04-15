'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, Award, Trophy, ArrowRight, Info, Phone, MapPin, 
  Users, Calendar, ShieldCheck, Star, Sparkles
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

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

const CLASSES = [
  { name: 'Lớp U7 (5-7 tuổi)', desc: 'Làm quen với bóng, phát triển vận động cơ bản.', icon: Star },
  { name: 'Lớp U10 (8-10 tuổi)', desc: 'Kỹ thuật dẫn bóng, ném rổ và phối hợp đồng đội.', icon: Users },
  { name: 'Lớp U13 (11-13 tuổi)', desc: 'Chiến thuật thi đấu và nâng cao thể lực chuyên sâu.', icon: ShieldCheck },
];

export default function SundaySunsetProfile() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="profile-page min-h-screen bg-slate-950 text-white">
      {/* ---- NAVBAR ---- */}
      <nav className={`landing-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🏀</span>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">SUNDAY - SUNSET</span>
              <span className="text-[10px] tracking-[0.2em] text-indigo-400 font-bold uppercase -mt-1">BASKETBALL ACADEMY</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-5 mr-2">
              <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-2">
                <Users size={16}/> Cổng HLV
              </Link>
              <Link href="/dang-nhap" className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2">
                <ShieldCheck size={16}/> Quản trị
              </Link>
            </div>
            <a href="tel:0392412022" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
              <Phone size={14} className="animate-pulse" />
              <span>0392.41.2022</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-in text-center mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-xs font-bold text-amber-400 mb-6">
              <Sparkles size={14} />
              <span>Học viện bóng rổ hàng đầu Thái Nguyên</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Nơi ươm mầm<br />
              <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-amber-500 bg-clip-text text-transparent italic">Tài năng bóng rổ trẻ</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              Học viện Sunday - Sunset (Since 2020) dẫn đầu Thái Nguyên về đào tạo chuyên sâu, phát triển chiều cao và tư duy thi đấu bài bản cho trẻ em.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://www.facebook.com/sundaysunset22" target="_blank" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 group">
                Đăng ký học ngay
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#about" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all">
                Tìm hiểu thêm
                <Info size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- PHILOSOPHY ---- */}
      <section id="about" className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Triết lý <span className="text-indigo-400">Sunday - Sunset</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">"Một dân tộc muốn khỏe phải bắt đầu từ trẻ em..." - Chúng tôi tin rằng bóng rổ là chìa khóa để trẻ phát triển toàn diện.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GOALS.map((g) => (
              <div key={g.title} className="group p-8 bg-slate-800/50 border border-white/5 rounded-3xl hover:bg-slate-800 hover:border-indigo-500/30 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: `${g.color}20` }}>
                  <g.icon size={28} style={{ color: g.color }} />
                </div>
                <h3 className="text-xl font-bold mb-4">{g.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CLASSES ---- */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Các lớp đào tạo <span className="text-amber-500">Chuyên nghiệp</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLASSES.map((c) => (
              <div key={c.name} className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900 border border-white/5 rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
                <c.icon className="text-indigo-400 mb-4" size={32} />
                <h3 className="text-lg font-bold text-indigo-300 mb-2">{c.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CONTACT ---- */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-700 to-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">Liên hệ với <br/>Huấn luyện viên</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <Phone className="text-amber-300" />
                    <div>
                      <p className="text-indigo-200 text-xs">Hotline 24/7</p>
                      <p className="font-bold text-lg">0392.41.2022 (Mr. Hưng)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <MapPin className="text-amber-300" />
                    <div>
                      <p className="text-pink-200 text-xs">Trụ sở chính</p>
                      <p className="font-bold text-lg">TP. Thái Nguyên</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] text-slate-900 shadow-2xl">
                 <h3 className="text-xl font-bold mb-2">Cổng thông tin</h3>
                 <p className="text-sm text-slate-500 mb-8">Dành riêng cho Phụ huynh & Huấn luyện viên Sunday - Sunset.</p>
                 <div className="space-y-3">
                    <Link href="/dang-nhap" className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white w-full py-4 rounded-xl font-black hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20">
                       <ShieldCheck size={20} /> BIỂU ĐỒ QUẢN TRỊ (CHỦ SÂN)
                    </Link>
                    <Link href="/login" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white w-full py-4 rounded-xl font-bold border border-slate-700 transition-colors">
                       <Users size={20} /> Truy cập của Huấn luyện viên
                    </Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 {APP_NAME}. Powering Basketball in Thái Nguyên.</p>
      </footer>
    </div>
  );
}
