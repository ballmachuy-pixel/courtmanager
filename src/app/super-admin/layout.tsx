import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/auth/impersonation';

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Kiểm tra quyền Super Admin
  if (!user || !(await isSuperAdmin(user))) {
    // Nếu không có quyền, đá về dashboard thường hoặc trang login
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
      {/* Sidebar giả lập cho SAP */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-[#0f0f0f] p-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20" />
          <h1 className="text-xl font-bold tracking-tight">Tháp Điều Khiển</h1>
        </div>
        
        <nav className="space-y-1">
          <a href="/super-admin" className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10">
            <span>🏟️</span> Học viện
          </a>
          <a href="/super-admin/partners" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white">
            <span>🤝</span> Đối tác
          </a>
          <a href="/super-admin/analytics" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white">
            <span>📊</span> Hệ thống
          </a>
          <a href="/super-admin/roles" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-indigo-400/70 transition-colors hover:bg-indigo-500/10 hover:text-indigo-400 mt-4 border border-indigo-500/10">
            <span>🛡️</span> Quản lý Quản trị viên
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-4 border border-purple-500/10">
            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1">Super Admin Mode</p>
            <p className="text-xs text-white/70 line-clamp-1">{user.email}</p>
          </div>
        </div>
      </aside>

      <main className="pl-64">
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-sm font-semibold text-white/70">Tổng quan hệ thống</h2>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status: Operational</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
