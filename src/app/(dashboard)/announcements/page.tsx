import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Megaphone, Send, Clock, UserCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AnnouncementsPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: announcements, error } = await supabase
    .from('announcements')
    .select(`
      *,
      academy_members(display_name)
    `)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error);
  }

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Thông Báo</h1>
          <p className="text-slate-400 font-medium">Gửi thông báo và quản lý tin nhắn tới phụ huynh</p>
        </div>
        <div className="relative z-10">
          <Link href="/announcements/new" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center gap-3 transition-all shadow-xl shadow-amber-600/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:scale-95 w-full md:w-auto justify-center">
            <Plus size={20} strokeWidth={3} />
            TẠO THÔNG BÁO
          </Link>
        </div>
      </div>

      {/* Announcement List */}
      <div className="mt-2">
        {announcements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 rounded-3xl p-1 shadow-xl shadow-black/40 transition-all group">
                <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                        <Megaphone size={22} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">{ann.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock size={10} /> {formatDate(ann.created_at)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <UserCircle size={10} /> {ann.academy_members?.display_name || 'Quản trị viên'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-black text-slate-300 border border-white/10 uppercase tracking-wider">
                        {ann.target === 'all' ? 'Toàn trung tâm' : ann.target === 'class' ? 'Theo lớp' : 'Theo học viên'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">
                    {ann.content}
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">
                    <Send size={10} /> Đã gửi thông báo tới phụ huynh
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-slate-900/30 rounded-[2rem] border border-white/5 border-dashed relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
                <Megaphone size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Chưa có thông báo nào</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 font-medium">Tạo thông báo đầu tiên để gửi thông tin cho phụ huynh.</p>
              <Link href="/announcements/new" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-xl text-sm font-black inline-flex items-center gap-3 transition-all shadow-xl shadow-amber-600/25 hover:shadow-amber-500/40 hover:-translate-y-1 active:scale-95">
                <Plus size={20} /> TẠO THÔNG BÁO ĐẦU TIÊN
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
