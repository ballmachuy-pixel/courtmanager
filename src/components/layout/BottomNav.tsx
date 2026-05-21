'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, DollarSign } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Tổng quan', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Điểm danh', icon: CheckSquare, href: '/attendance' },
    { label: 'Học viên', icon: Users, href: '/students' },
    { label: 'Tài chính', icon: DollarSign, href: '/finance' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? 'text-purple-500' : 'text-slate-500'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                {isActive && (
                  <div className="absolute -inset-2 bg-purple-500/10 blur-md rounded-full -z-10" />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
