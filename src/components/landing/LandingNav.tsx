import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <Trophy size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-white">CourtManager</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-white/60 hover:text-white transition-colors">Tính năng</a>
            <a href="#contact" className="text-sm font-bold text-white/60 hover:text-white transition-colors">Khách hàng</a>
            <Link 
              href="/dang-nhap" 
              className="bg-white text-[#0a0a0a] px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 transition-all shadow-xl shadow-white/10"
            >
              Đăng nhập / Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
