'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface HubActionProps {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'warning' | 'danger' | 'success';
  accentColor?: string; // e.g. 'blue', 'emerald', 'purple', 'amber', 'red', 'pink'
  disabled?: boolean;
}

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string; badgeBg: string; badgeText: string }> = {
  blue:    { bg: 'hover:bg-blue-500/5',    text: 'group-hover:text-blue-300',    border: 'hover:border-blue-500/30',    iconBg: 'bg-blue-500/15 text-blue-400',    badgeBg: 'bg-blue-500/20',    badgeText: 'text-blue-300' },
  emerald: { bg: 'hover:bg-emerald-500/5', text: 'group-hover:text-emerald-300', border: 'hover:border-emerald-500/30', iconBg: 'bg-emerald-500/15 text-emerald-400', badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-300' },
  purple:  { bg: 'hover:bg-purple-500/5',  text: 'group-hover:text-purple-300',  border: 'hover:border-purple-500/30',  iconBg: 'bg-purple-500/15 text-purple-400',  badgeBg: 'bg-purple-500/20',  badgeText: 'text-purple-300' },
  amber:   { bg: 'hover:bg-amber-500/5',   text: 'group-hover:text-amber-300',   border: 'hover:border-amber-500/30',   iconBg: 'bg-amber-500/15 text-amber-400',   badgeBg: 'bg-amber-500/20',   badgeText: 'text-amber-300' },
  red:     { bg: 'hover:bg-red-500/5',     text: 'group-hover:text-red-300',     border: 'hover:border-red-500/30',     iconBg: 'bg-red-500/15 text-red-400',     badgeBg: 'bg-red-500/20',     badgeText: 'text-red-300' },
  pink:    { bg: 'hover:bg-pink-500/5',    text: 'group-hover:text-pink-300',    border: 'hover:border-pink-500/30',    iconBg: 'bg-pink-500/15 text-pink-400',    badgeBg: 'bg-pink-500/20',    badgeText: 'text-pink-300' },
  indigo:  { bg: 'hover:bg-indigo-500/5',  text: 'group-hover:text-indigo-300',  border: 'hover:border-indigo-500/30',  iconBg: 'bg-indigo-500/15 text-indigo-400',  badgeBg: 'bg-indigo-500/20',  badgeText: 'text-indigo-300' },
  cyan:    { bg: 'hover:bg-cyan-500/5',    text: 'group-hover:text-cyan-300',    border: 'hover:border-cyan-500/30',    iconBg: 'bg-cyan-500/15 text-cyan-400',    badgeBg: 'bg-cyan-500/20',    badgeText: 'text-cyan-300' },
};

export default function HubAction({
  href,
  icon: Icon,
  label,
  description,
  badge,
  badgeVariant = 'default',
  accentColor = 'blue',
  disabled = false,
}: HubActionProps) {
  const colors = colorMap[accentColor] ?? colorMap.blue;

  // Badge variant override for danger/warning
  const badgeStyle =
    badgeVariant === 'danger'
      ? 'bg-red-500/20 text-red-300'
      : badgeVariant === 'warning'
      ? 'bg-amber-500/20 text-amber-300'
      : badgeVariant === 'success'
      ? 'bg-emerald-500/20 text-emerald-300'
      : `${colors.badgeBg} ${colors.badgeText}`;

  return (
    <Link
      href={disabled ? '#' : href}
      onClick={(e) => disabled && e.preventDefault()}
      className={`group flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-200 ${
        disabled 
          ? 'opacity-40 grayscale-[50%] cursor-not-allowed' 
          : `${colors.bg} ${colors.border} cursor-pointer active:scale-[0.98]`
      } select-none`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${colors.iconBg}`}>
        <Icon size={16} className="sm:hidden" />
        <Icon size={20} className="hidden sm:block" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-bold text-slate-200 transition-colors duration-200 truncate leading-tight ${colors.text}`}>
          {label}
        </p>
        {description && (
          <p className="hidden sm:block text-[11px] text-slate-600 mt-0.5 truncate font-medium">
            {description}
          </p>
        )}
      </div>

      {/* Badge */}
      {badge !== undefined && badge !== null && badge !== 0 && !disabled && (
        <span className={`shrink-0 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md sm:rounded-lg tracking-wide ${badgeStyle}`}>
          {badge}
        </span>
      )}
      
      {disabled && (
        <span className={`shrink-0 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md sm:rounded-lg tracking-wide bg-slate-800/80 text-slate-500 border border-slate-700/50`}>
          Đang khóa
        </span>
      )}
    </Link>
  );
}
