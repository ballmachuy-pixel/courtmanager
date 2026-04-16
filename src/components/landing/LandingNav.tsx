'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, ShieldCheck, Phone } from 'lucide-react';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-12 h-12 group-hover:scale-110 transition-transform bg-white rounded-2xl p-1.5 shadow-xl shadow-indigo-500/20">
            <Image 
              src="/logo-academy.png" 
              alt="Sunday Sunset Logo" 
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight leading-none text-white">SUNDAY - SUNSET</span>
            <span className="text-[10px] tracking-[0.3em] text-indigo-400 font-extrabold uppercase mt-1">
              Basketball Academy
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-8 mr-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2 group"
            >
              <Users size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span>Cổng HLV</span>
            </Link>
            <Link 
              href="/dang-nhap" 
              className="text-sm font-bold text-slate-400 hover:text-amber-400 transition-all flex items-center gap-2 group"
            >
              <ShieldCheck size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Quản trị viên</span>
            </Link>
          </div>
          <a 
            href="tel:0392412022" 
            className="flex items-center gap-3 bg-white text-indigo-600 hover:bg-slate-100 px-6 py-2.5 rounded-2xl text-sm font-black transition-all shadow-xl shadow-white/10 active:scale-95 group"
          >
            <Phone size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">0392.41.2022</span>
            <span className="sm:hidden text-xs">Gọi ngay</span>
          </a>
        </div>
      </div>
    </nav>

  );
}
