import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { SKILL_LABELS } from '@/lib/utils';
import { StudentFilters } from './StudentFilters';

// Skill level badge colors
const SKILL_COLORS: Record<string, string> = {
  beginner:     'bg-sky-500/10 text-sky-400 border-sky-500/20',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

// Rotating avatar gradient colors
const AVATAR_COLORS = [
  'from-pink-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];

export default async function StudentsPage(props: { searchParams: Promise<{ q?: string, status?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';
  const status = searchParams.status || '';

  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  // Lean query — only what the compact list needs (no joins, no avatar)
  let query = supabase
    .from('students')
    .select('id, full_name, skill_level, is_active')
    .eq('academy_id', academyId);

  if (q)                     query = query.ilike('full_name', `%${q}%`);
  if (status === 'active')   query = query.eq('is_active', true);
  if (status === 'inactive') query = query.eq('is_active', false);

  const { data: students, error } = await query.order('full_name', { ascending: true });
  if (error) console.error('Students fetch error:', error);

  const total = students?.length ?? 0;

  return (
    <div className="animate-in flex flex-col gap-5">
      {/* Compact header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Học Viên</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">{total} học viên trong học viện</p>
        </div>
        <Link
          href="/students/new"
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20 hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="hidden sm:inline">THÊM</span>
        </Link>
      </div>

      {/* Search / filter bar */}
      <div className="glass-card p-4">
        <StudentFilters />
      </div>

      {/* Compact list — each row ~48px, tap to open full profile */}
      {students && students.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {students.map((student: any, index: number) => {
              const avatarGradient = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const initial = student.full_name.charAt(0).toUpperCase();
              const skillLabel = SKILL_LABELS[student.skill_level] || student.skill_level;
              const skillColor = SKILL_COLORS[student.skill_level] ?? 'bg-white/5 text-slate-400 border-white/10';

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] active:bg-white/10 transition-colors group"
                >
                  {/* Small colored initial — no heavy avatar image */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                    {initial}
                  </div>

                  {/* Full name */}
                  <p className="flex-1 text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                    {student.full_name}
                  </p>

                  {/* Skill badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide shrink-0 ${skillColor}`}>
                    {skillLabel}
                  </span>

                  {/* Status dot */}
                  <div
                    title={student.is_active ? 'Đang học' : 'Đã nghỉ'}
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      student.is_active
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]'
                        : 'bg-slate-600'
                    }`}
                  />

                  {/* Arrow hint */}
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-16 px-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Users className="text-slate-600" size={24} />
          </div>
          <h3 className="text-base font-black text-white mb-1">
            {q || status ? 'Không tìm thấy học viên phù hợp' : 'Chưa có học viên nào'}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-5 font-medium">
            {q || status
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
              : 'Bắt đầu bằng cách thêm học viên đầu tiên.'}
          </p>
          {!q && !status && (
            <Link
              href="/students/new"
              className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Thêm Học Viên Ngay
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
