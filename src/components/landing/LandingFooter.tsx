import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export default function LandingFooter() {
  return (
    <footer className="py-20 bg-slate-950 border-t border-white/5 text-center text-slate-500 text-sm">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        <div className="relative w-20 h-20 opacity-30 hover:opacity-100 transition-all duration-700">
          <Image 
            src="/logo-academy.png" 
            alt="Sunday Sunset Logo" 
            fill
            className="object-contain grayscale"
          />
        </div>
        <div className="max-w-md">
          <p className="font-bold text-slate-400 mb-2 tracking-widest uppercase text-xs">SUNDAY - SUNSET BASKETBALL ACADEMY</p>
          <p>© 2026 {APP_NAME}. Powering the next generation of athletes in Thái Nguyên.</p>
        </div>
      </div>
    </footer>

  );
}

