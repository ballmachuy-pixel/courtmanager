'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LogOut, X, ChevronRight, LayoutDashboard, Users, GraduationCap, ClipboardCheck, Shield,
  BarChart3, FileText, Bell, Settings, Calendar, Menu, ChevronDown, Check
} from 'lucide-react';
import { switchAcademy } from '@/app/actions/academy';

// ─── Navigation groups for Admin ───────────────────────────────────────────
const NAV_GROUP_1 = [
  { label: 'Tổng quan',  href: '/dashboard',    icon: LayoutDashboard, badgeKey: null },
  { label: 'Học viên',   href: '/students',      icon: Users,           badgeKey: 'students' },
  { label: 'Lớp học',    href: '/classes',       icon: GraduationCap,   badgeKey: 'classes' },
  { label: 'Điểm danh',  href: '/attendance',    icon: ClipboardCheck,  badgeKey: null },
  { label: 'Nhân sự',    href: '/staff',         icon: Shield,          badgeKey: null },
] as const;

const NAV_GROUP_2 = [
  { label: 'Thống kê',   href: '/analytics',    icon: BarChart3, badgeKey: null },
  { label: 'Báo cáo',    href: '/reports',      icon: FileText,  badgeKey: null },
  { label: 'Thông báo',  href: '/announcements',icon: Bell,      badgeKey: null },
  { label: 'Cài đặt',    href: '/settings',     icon: Settings,  badgeKey: null },
] as const;

type BadgeCounts = { students: number; classes: number };

// ─── NavItem component ──────────────────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, badge, isActive, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  badge?: number; isActive: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`w-5 flex items-center justify-center shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400'}`}>
        <Icon size={18} />
      </div>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 shrink-0">
          {badge}
        </span>
      )}
      {isActive && !badge && (
        <ChevronRight size={13} className="text-indigo-500/40 shrink-0" />
      )}
    </Link>
  );
}

// ─── Group label ────────────────────────────────────────────────────────────
function NavGroupLabel({ label }: { label: string }) {
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-3 pt-4 pb-1.5 first:pt-1">
      {label}
    </p>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [academyName, setAcademyName] = useState('Academy');
  const [role, setRole] = useState('');
  const [academiesList, setAcademiesList] = useState<Array<{id: string, name: string, role: string}>>([]);
  const [showAcademyDropdown, setShowAcademyDropdown] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [badges, setBadges] = useState<BadgeCounts>({ students: 0, classes: 0 });

  useEffect(() => {
    const fetchUser = async () => {
      // 1. PRIORITIZE COACH SESSION (New PIN-based system)
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUserName(data.display_name);
          setAcademyName(data.academy_name || 'Academy');
          setRole('Huấn luyện viên');
          setIsInitializing(false);
          return; // Stop here if it's a coach
        }
      } catch (e) {
        console.warn('Coach session check failed, falling back to Supabase');
      }

      // 2. FALLBACK TO SUPABASE (Admin system)
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUserName(session.user.user_metadata?.full_name || session.user.email);

        const [{ data: owned }, { data: memberOf }] = await Promise.all([
          supabase.from('academies').select('id, name').eq('owner_id', session.user.id),
          supabase.from('academy_members').select('academies(id, name), role').eq('user_id', session.user.id)
        ]);

        const allAcademies: Array<{id: string, name: string, role: string}> = [];
        if (owned) {
          allAcademies.push(...owned.map(a => ({ id: a.id, name: a.name, role: 'Admin' })));
        }
        if (memberOf) {
          memberOf.forEach(m => {
            const acadData = Array.isArray(m.academies) ? m.academies[0] : m.academies;
            if (acadData) {
               allAcademies.push({ id: acadData.id, name: acadData.name, role: m.role === 'admin' ? 'Admin' : 'Huấn luyện viên' });
            }
          });
        }

        setAcademiesList(allAcademies);

        const match = document.cookie.match(/(^| )cm_selected_academy=([^;]+)/);
        const cookieId = match ? match[2] : null;

        let activeAcademy = allAcademies.find(a => a.id === cookieId);
        if (!activeAcademy && allAcademies.length > 0) {
           activeAcademy = allAcademies[0];
        }

        if (activeAcademy) {
          setAcademyName(activeAcademy.name);
          setRole(activeAcademy.role);
          
          // Badge counts for Admin
          const [{ count: sCount }, { count: cCount }] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', activeAcademy.id).eq('is_active', true),
            supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', activeAcademy.id),
          ]);
          setBadges({ students: sCount || 0, classes: cCount || 0 });
        }
      }
      setIsInitializing(false);
    };

    fetchUser();
  }, []);

  const isCoach = role === 'Huấn luyện viên' || role === 'coach';

  useEffect(() => {
    if (!isInitializing && isCoach) {
      // If coach tries to access Admin pages, kick them back to /coach
      const adminPages = ['/dashboard', '/students', '/classes', '/attendance', '/staff', '/analytics', '/reports', '/settings'];
      if (adminPages.some(page => pathname === page || pathname.startsWith(page + '/'))) {
        router.replace('/coach');
      }
    }
  }, [pathname, isCoach, isInitializing, router]);

  const handleLogout = async () => {
    // Clear both session types
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = isCoach ? '/login' : '/dang-nhap'; 
  };

  const handleSwitchAcademy = async (id: string) => {
    setShowAcademyDropdown(false);
    setIsInitializing(true);
    await switchAcademy(id);
    window.location.reload(); 
  };

  const close = () => setSidebarOpen(false);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest animate-pulse">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-bg)] relative">

      {/* ── Mobile Topbar ────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-center px-4 z-[200]">
        <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-sm">
          <span className="text-xl">🏀</span> Sunday - Sunset
        </Link>
      </div>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] fade-in"
      >
        {isCoach ? (
          <Link href="/coach" className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] ${pathname.startsWith('/coach') ? 'text-indigo-400' : 'text-slate-400'}`}>
            <Calendar size={20} />
            <span className="text-[10px] font-bold">Lịch dạy</span>
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] ${pathname === '/dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-bold">Tổng quan</span>
            </Link>
            <Link href="/students" className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] relative ${pathname.startsWith('/students') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}>
              <Users size={20} />
              <span className="text-[10px] font-bold">Học viên</span>
              {badges.students > 0 && <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
            </Link>
            <Link href="/classes" className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] relative ${pathname.startsWith('/classes') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}>
              <GraduationCap size={20} />
              <span className="text-[10px] font-bold">Lớp học</span>
              {badges.classes > 0 && <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
            </Link>
            <Link href="/attendance" className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] ${pathname.startsWith('/attendance') ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}>
              <ClipboardCheck size={20} />
              <span className="text-[10px] font-bold">Điểm danh</span>
            </Link>
          </>
        )}
        <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 py-3 px-2 min-w-[64px] text-slate-400 hover:text-slate-300">
          <Menu size={20} />
          <span className="text-[10px] font-bold">Menu</span>
        </button>
      </nav>

      {/* ── Sidebar Backdrop (Mobile) ────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[990]"
          onClick={close}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`
        w-[250px] bg-slate-900/60 backdrop-blur-xl border-r border-white/5 flex flex-col
        fixed top-0 h-[100dvh] pb-[env(safe-area-inset-bottom)] z-[1000] transition-transform duration-300
        md:sticky md:translate-x-0 md:pb-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Desktop brand */}
        <div className="hidden md:flex items-center h-16 px-5 border-b border-white/5 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-white group">
            <span className="text-xl group-hover:scale-110 transition-transform">🏀</span>
            <span className="font-bold text-sm tracking-tight">Sunday - Sunset</span>
          </Link>
        </div>

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between h-[60px] px-4 border-b border-white/5 shrink-0">
          <span className="font-bold text-white text-sm">Menu</span>
          <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Academy info card & Switcher */}
        <div className="px-4 py-3 border-b border-white/5 shrink-0 relative">
          <button 
            onClick={() => !isCoach && academiesList.length > 1 && setShowAcademyDropdown(!showAcademyDropdown)}
            className={`w-full flex items-center justify-between text-left bg-white/[0.04] rounded-xl p-3 border border-white/5 transition-colors ${!isCoach && academiesList.length > 1 ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-pink-500/20 shrink-0">
                {academyName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{academyName}</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{role || 'Đang tải...'}</div>
              </div>
            </div>
            {!isCoach && academiesList.length > 1 && (
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showAcademyDropdown ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dropdown Menu */}
          {showAcademyDropdown && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 py-2 bg-slate-900/50">
                Chọn trung tâm
              </div>
              <div className="max-h-48 overflow-y-auto">
                {academiesList.map(ac => (
                  <button
                    key={ac.id}
                    onClick={() => handleSwitchAcademy(ac.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className={`text-sm font-bold truncate ${ac.name === academyName ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {ac.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ac.role}
                      </div>
                    </div>
                    {ac.name === academyName && (
                      <Check size={16} className="text-indigo-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {isCoach ? (
            // Coach: only 1 link
            <Link
              href="/coach"
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 ${
                pathname.startsWith('/coach')
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Calendar size={18} />
              <span>Lịch dạy &amp; Điểm danh</span>
            </Link>
          ) : (
            <>
              {/* Group 1: Daily operations */}
              <NavGroupLabel label="Điều Hành" />
              {NAV_GROUP_1.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const badge = item.badgeKey ? badges[item.badgeKey as keyof BadgeCounts] : undefined;
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    badge={badge}
                    isActive={isActive}
                    onClick={close}
                  />
                );
              })}

              {/* Divider */}
              <div className="my-3 border-t border-white/[0.04]" />

              {/* Group 2: System & reports */}
              <NavGroupLabel label="Hệ Thống" />
              {NAV_GROUP_2.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    onClick={close}
                  />
                );
              })}
            </>
          )}
        </nav>

        {/* ── User footer ────────────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between bg-white/[0.03] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-[11px] border border-white/10 shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-300 truncate">
                {userName || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="hidden md:flex h-16 border-b border-white/5 bg-[#0f1117]/70 backdrop-blur-xl sticky top-0 z-[200] items-center justify-end px-8">
          {/* Reserved for future: notifications, global search */}
        </header>

        <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto w-full md:mt-0 mt-[60px] pb-[100px] md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
