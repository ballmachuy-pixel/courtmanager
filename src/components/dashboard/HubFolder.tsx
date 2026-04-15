'use client';

import type { LucideIcon } from 'lucide-react';


interface HubFolderProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string; // e.g. 'text-emerald-400'
  accentGradient?: string; // e.g. 'from-emerald-500/20 to-teal-500/5'
  children: React.ReactNode;
}

export default function HubFolder({
  title,
  icon: Icon,
  iconColor = 'text-slate-400',
  accentGradient = 'from-white/5 to-transparent',
  children,
}: HubFolderProps) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Folder Header */}
      <div className={`px-3 sm:px-5 pt-3 sm:pt-5 pb-2.5 sm:pb-4 bg-gradient-to-br ${accentGradient} border-b border-white/5`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-white/5 ${iconColor}`}>
            <Icon size={13} />
          </div>
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
            {title}
          </h3>
        </div>
      </div>

      {/* Folder Contents */}
      <div className="p-1.5 sm:p-3 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}
