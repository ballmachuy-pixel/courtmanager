import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, ClipboardCheck } from 'lucide-react';
import { formatDate, ATTENDANCE_LABELS } from '@/lib/utils';

export default async function AttendanceHistoryPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: academyClasses } = await supabase.from('classes').select('id').eq('academy_id', academyId);
  const classIds = academyClasses?.map((c: any) => c.id) || [];
  
  const { data: safeRecords } = await supabase
    .from('attendances')
    .select(`
      *,
      students(full_name),
      classes(name),
      academy_members(display_name)
    `)
    .in('class_id', classIds)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      <Link href="/attendance" className="flex items-center gap-2 text-slate-400 hover:text-pink-400 text-sm font-medium transition-colors w-fit">
        <ArrowLeft size={16} /> Quay lại Điểm danh
      </Link>

      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Lịch Sử Điểm Danh</h1>
          <p className="text-slate-400 font-medium text-sm">50 lượt điểm danh gần nhất</p>
        </div>
      </div>

      {/* Records */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
        <div className="bg-slate-950/50 rounded-[1.35rem]">
          <div className="p-6 md:p-8 border-b border-white/5">
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <ClipboardCheck size={20} className="text-white" />
              </div>
              Nhật ký điểm danh
            </h2>
          </div>

          {safeRecords && safeRecords.length > 0 ? (
            <div className="divide-y divide-white/5">
              {safeRecords.map((record: any) => {
                const isPresent = record.status === 'present';
                const isAbsent = record.status === 'absent';
                const isLate = record.status === 'late';

                return (
                  <div key={record.id} className="p-4 md:px-8 flex flex-col md:flex-row md:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                    {/* Student */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPresent ? 'bg-emerald-500/10 text-emerald-400' :
                        isAbsent ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {isPresent ? <CheckCircle size={20} /> : isAbsent ? <XCircle size={20} /> : <AlertCircle size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{record.students?.full_name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{record.classes?.name}</div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 md:w-28">
                      <Clock size={12} /> {formatDate(record.date)}
                    </div>

                    {/* Status */}
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit ${
                      isPresent ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      isAbsent ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ATTENDANCE_LABELS[record.status] || record.status}
                    </span>

                    {/* Recorder */}
                    <div className="text-[10px] text-slate-600 md:w-28 md:text-right">
                      {record.academy_members?.display_name || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <ClipboardCheck size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Chưa có dữ liệu</h3>
              <p className="text-slate-400 text-sm">Lịch sử điểm danh sẽ hiển thị khi có dữ liệu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
