import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, Clock } from 'lucide-react';
import { SKILL_LABELS } from '@/lib/utils';

export default async function ClassesPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  // Fetch classes along with schedule count and student count (using count)
  const { data: classes, error } = await supabase
    .from('classes')
    .select(`
      *,
      head_coach:academy_members!head_coach_id(display_name),
      schedules(id)
    `)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
  }

  // Khá phức tạp để lấy chính xác count student cho từng lớp bằng 1 join query nếu không có view, 
  // cho MVP ta sẽ lấy trực tiếp list student_classes và gom nhóm lại (vì data chưa lớn)
  const { data: enrolled } = await supabase
    .from('student_classes')
    .select('class_id');

  const enrolledMap = enrolled?.reduce((acc: any, curr: any) => {
    acc[curr.class_id] = (acc[curr.class_id] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 classes-page pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Lớp Học</h1>
          <p className="text-slate-400 font-medium">Quản lý và điều phối các khóa bóng rổ của học viện</p>
        </div>
        <div className="relative z-10">
          <Link href="/classes/new" className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:scale-95 w-full md:w-auto justify-center">
            <Plus size={20} strokeWidth={3} />
            THÊM LỚP MỚI
          </Link>
        </div>
      </div>

      <div className="mt-2">
        {classes && classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classes.map((c: any) => {
              const studentCount = enrolledMap[c.id] || 0;
              const scheduleCount = c.schedules?.length || 0;
              return (
                <div key={c.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-pink-500/50 rounded-3xl p-1 transition-all hover:bg-slate-800/60 group relative overflow-hidden shadow-xl shadow-black/40 hover:shadow-pink-500/10">
                  <div className="bg-slate-950/50 rounded-[1.35rem] h-full p-6 flex flex-col relative z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    <Link href={`/classes/${c.id}`} className="flex flex-col h-full w-full outline-none">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-black text-white text-xl md:text-2xl group-hover:text-pink-400 transition-colors mb-1 line-clamp-2">{c.name}</h3>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {c.age_group ? `${c.age_group} Tuổi` : 'Mọi độ tuổi'}
                          </div>
                        </div>
                        <span className="inline-flex px-3 py-1.5 bg-pink-500/10 text-pink-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-pink-500/20 whitespace-nowrap shrink-0 ml-4 shadow-inner">
                          {SKILL_LABELS[c.skill_level] || c.skill_level || 'Mọi trình độ'}
                        </span>
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Users size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Học sinh</span>
                            </div>
                            <div className="text-white font-black text-lg">
                              {studentCount} <span className="text-slate-500 text-sm font-medium">/ {c.max_students}</span>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Clock size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Lịch học</span>
                            </div>
                            <div className="text-white font-black text-lg">
                              {scheduleCount} <span className="text-slate-500 text-sm font-medium">buổi/tuần</span>
                            </div>
                          </div>
                        </div>

                        {/* Coach Info */}
                        <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 mt-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-purple-500/25 shrink-0">
                             {c.head_coach?.[0]?.display_name?.charAt(0).toUpperCase() || (c.head_coach?.display_name?.charAt(0).toUpperCase()) || 'H'}
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Huấn Luyện Viên</div>
                            <div className="text-slate-200 font-bold text-sm line-clamp-1">{c.head_coach?.[0]?.display_name || c.head_coach?.display_name || 'Chưa phân công'}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-slate-900/30 rounded-[2rem] border border-white/5 border-dashed relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-pink-500/20">
                <Users size={32} className="text-pink-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Chưa có lớp học nào</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 font-medium">Bạn chưa bắt đầu giảng dạy? Hãy tạo lớp đầu tiên để nhận học viên nhé.</p>
              <Link href="/classes/new" className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white px-8 py-4 rounded-xl text-sm font-black inline-flex items-center gap-3 transition-all shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 hover:-translate-y-1 active:scale-95">
                <Plus size={20} /> TẠO LỚP HỌC ĐẦU TIÊN
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
