import { createAdminClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, BookOpen, AlertCircle, ArrowRight,
  MapPin, Calendar, ExternalLink, Sparkles,
  ShieldCheck, UserX, ShieldAlert, Edit3, ClipboardCheck
} from 'lucide-react';
import { formatDate, getICTDateString, getICTStartOfDayUTC, getDayOfWeekICT } from '@/lib/utils';
import OverrideCheckinButton from '@/components/dashboard/OverrideCheckinButton';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import ManagementHub from '@/components/dashboard/ManagementHub';
import { Academy, Student, Class, Schedule, StaffCheckin } from '@/types/database';

// Extended type for joined queries
interface ScheduleWithClass extends Schedule {
  classes: {
    name: string;
    academy_id: string;
  };
}

interface CheckinWithDetails extends StaffCheckin {
  academy_members: {
    display_name: string;
  };
  schedules: {
    classes: {
      name: string;
    }
  };
}

export default async function DashboardPage() {
  // ═══ STEP 1: Auth & Academy ID ═══
  // Pattern matches all other working pages — NO outer try-catch
  // error.tsx handles any uncaught runtime errors
  const academyId = await getCurrentAcademyId();
  
  if (!academyId) {
    const supabaseSessionClient = await createClient();
    let user = null;
    try {
      const { data } = await supabaseSessionClient.auth.getUser();
      user = data?.user ?? null;
    } catch (err) {
      console.error('[Dashboard] getUser failed:', err);
    }
    // Redirects MUST be outside try-catch — they throw NEXT_REDIRECT internally
    if (user) return redirect('/onboarding');
    return redirect('/dang-nhap');
  }

  // ═══ STEP 2: Data Fetching (fully safe) ═══
  let academy: Academy | null = null;
  let studentCount = 0;
  let classCount = 0;
  let absentCount = 0;
  let invalidCheckinsCount = 0;
  let totalAttendanceToday = 0;
  let overduePaymentCount = 0;
  let todaySchedules: ScheduleWithClass[] = [];
  let todayCheckins: CheckinWithDetails[] = [];
  let userId: string | undefined = undefined;

  try {
    const supabase = createAdminClient();
    const todayStr = getICTDateString();
    const todayStart = getICTStartOfDayUTC();

    const [
      academyRes, 
      studentRes, 
      classRes,
      absentRes,
      invalidRes,
      attendanceRes,
      paymentRes,
    ] = await Promise.all([
      supabase.from('academies').select('name').eq('id', academyId).single(),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      supabase.from('attendances').select('*, classes!inner(academy_id)', { count: 'exact', head: true }).eq('classes.academy_id', academyId).eq('date', todayStr).eq('status', 'absent'),
      supabase.from('staff_checkins').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', todayStart.toISOString()).eq('is_valid', false),
      supabase.from('attendances').select('*, classes!inner(academy_id)', { count: 'exact', head: true }).eq('classes.academy_id', academyId).eq('date', todayStr).in('status', ['present', 'late']),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'overdue'),
    ]);

    academy = academyRes.data as Academy | null;
    studentCount = studentRes.count || 0;
    classCount = classRes.count || 0;
    absentCount = absentRes.count || 0;
    invalidCheckinsCount = invalidRes.count || 0;
    totalAttendanceToday = attendanceRes.count || 0;
    overduePaymentCount = (paymentRes as any)?.count || 0;

    const supabaseSession = await createClient();
    const { data: authUser } = await supabaseSession.auth.getUser();
    userId = authUser?.user?.id;

    // Today's schedule - Optimized for coach view
    const todayDayOfWeek = getDayOfWeekICT();
    const { data: todaySchedulesData } = await supabase
      .from('schedules')
      .select('*, classes!inner(name, academy_id, coach_id)')
      .eq('classes.academy_id', academyId)
      .eq('day_of_week', todayDayOfWeek)
      .order('start_time', { ascending: true });

    let rawSchedules = (todaySchedulesData as unknown as any[]) || [];
    
    // If the viewer is a coach, prioritize their own sessions
    if (userId) {
      rawSchedules = rawSchedules.sort((a, b) => {
        const aIsMine = a.coach_id === userId || (a.classes?.coach_id === userId && !a.coach_id);
        const bIsMine = b.coach_id === userId || (b.classes?.coach_id === userId && !b.coach_id);
        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        return 0; // Maintain time order if both are mine or both aren't
      });
    }

    todaySchedules = rawSchedules;

    // Staff checkins
    const { data: todayCheckinsData } = await supabase
      .from('staff_checkins')
      .select('*, academy_members!staff_checkins_coach_id_fkey(display_name), schedules(classes(name))')
      .eq('academy_id', academyId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    todayCheckins = (todayCheckinsData as unknown as CheckinWithDetails[]) || [];
  } catch (err) {
    console.error('[DashboardPage] Data fetch error:', err);
    // Continue with defaults — page will still render with zero values
  }

  // ═══ STEP 3: Safe Rendering ═══
  const academyName = academy?.name || 'Học viện';
  const safeSchedules = Array.isArray(todaySchedules) ? todaySchedules : [];
  const safeCheckins = Array.isArray(todayCheckins) ? todayCheckins : [];

  return (
    <div className="dashboard-v2 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-pink-500/20">
             <Sparkles size={12} />
             <span>Hệ thống quản lý thông minh</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Xin chào, <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{academyName}</span>
          </h1>
          <p className="text-slate-500 mt-1">Dưới đây là tổng quan hoạt động của học viện trong ngày.</p>
        </div>
      </div>

      <OnboardingChecklist studentCount={studentCount || 0} classCount={classCount || 0} />

      {/* ══ MANAGEMENT HUB — First thing visible on mobile ══ */}
      <ManagementHub
        todayScheduleCount={safeSchedules.length}
        invalidCheckinsCount={invalidCheckinsCount || 0}
        totalAttendanceToday={totalAttendanceToday || 0}
        studentCount={studentCount || 0}
        overduePaymentCount={overduePaymentCount || 0}
        classCount={classCount || 0}
      />

      {/* ══ STATS CARDS — Supporting info below the hub ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Học viên', val: studentCount || 0, icon: Users, theme: 'blue', sub: `Thành viên chính thức` },
          { label: 'Lớp học', val: classCount || 0, icon: BookOpen, theme: 'purple', sub: 'Đang vận hành' },
          { label: 'Có mặt hôm nay', val: totalAttendanceToday || 0, icon: ClipboardCheck, theme: 'emerald', sub: 'Học sinh đi học' },
          { label: 'Cảnh báo GPS', val: invalidCheckinsCount || 0, icon: ShieldAlert, theme: 'red', sub: 'Kiểm tra check-in' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-4 flex flex-col gap-3 relative overflow-hidden group ${stat.theme === 'red' && stat.val > 0 ? 'border-red-500/50 shadow-lg shadow-red-500/10 bg-red-950/20' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform ${stat.theme === 'red' ? 'bg-red-500/20' : stat.theme === 'emerald' ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
              <stat.icon size={18} className={stat.theme === 'red' ? 'text-red-500' : stat.theme === 'emerald' ? 'text-emerald-500' : ''} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${stat.theme === 'red' && stat.val > 0 ? 'text-red-400' : 'text-slate-500'}`}>{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.theme === 'red' && stat.val > 0 ? 'text-red-400' : stat.theme === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>{stat.val}</h3>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium hidden sm:block">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold flex items-center gap-3">
                   <Calendar size={22} className="text-pink-500" />
                   <span>Lịch thi đấu & Tập luyện</span>
                 </h3>
                 <Link href="/attendance" className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1">
                   Tất cả lịch <ExternalLink size={12}/>
                 </Link>
              </div>

              {safeSchedules.length > 0 ? (
                <div className="space-y-4">
                  {safeSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors group">
                      {/* Session Info */}
                      <div className="flex items-center gap-4 sm:contents">
                        <div className="bg-slate-950 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                          <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-black">Bắt đầu</span>
                          <span className="text-lg sm:text-xl font-bold">{schedule.start_time?.substring(0, 5) || '--:--'}</span>
                        </div>
                        <div className="flex-1 sm:hidden">
                          {((schedule as any).coach_id === (userId as any) || ((schedule as any).classes?.coach_id === (userId as any) && !(schedule as any).coach_id)) && (
                            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mb-1 border border-indigo-500/30">
                              <Sparkles size={8} /> Lịch của bạn
                            </span>
                          )}
                          <h4 className="font-bold text-base group-hover:text-pink-400 transition-colors line-clamp-1">{schedule.classes?.name || 'Lớp học'}</h4>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <MapPin size={10} /> {schedule.location || 'Sân tập'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {((schedule as any).coach_id === (userId as any) || ((schedule as any).classes?.coach_id === (userId as any) && !(schedule as any).coach_id)) && (
                            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-indigo-500/30">
                              <Sparkles size={8} /> Lịch của bạn
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-lg group-hover:text-pink-400 transition-colors">{schedule.classes?.name || 'Lớp học'}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} /> {schedule.location || 'Sân vận động chính'}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">Kết thúc: {schedule.end_time?.substring(0, 5) || '--:--'}</span>
                        </div>
                      </div>

                      <div className="sm:hidden flex items-center justify-between py-2 border-t border-white/5 mt-1">
                        <span className="text-[10px] text-slate-500">Kết thúc: {schedule.end_time?.substring(0, 5) || '--:--'}</span>
                      </div>

                      <Link href="/attendance" className="bg-pink-600/10 text-pink-500 px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 hover:text-white transition-all whitespace-nowrap text-center sm:text-left">
                        Điểm danh
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Calendar className="text-slate-700" size={32} />
                   </div>
                   <p className="text-slate-500 text-sm">Hôm nay không có lịch tập nào của hệ thống.</p>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
           {/* BRAND STATEMENT - Expert Choice */}
           <div className="glass-card p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-white/10 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                    <Sparkles size={20} />
                 </div>
                 <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Tập trung vào chuyên môn</h4>
                 <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6">
                    &ldquo;Đam mê dẫn lối thành công. Chúng tôi ưu tiên phát triển kỹ năng và tư duy thể thao vượt trội cho học viên.&rdquo;
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <span>Sunday - Sunset Academy</span>
                    <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                    <span>since 2020</span>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span>Check-in Nhân sự</span>
              </h3>

              {safeCheckins.length > 0 ? (
                <div className="space-y-4">
                   {safeCheckins.map((chk) => (
                    <div key={chk.id} className={`p-4 rounded-xl border ${chk.is_valid ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/20'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg ${chk.is_valid ? 'bg-emerald-600' : 'bg-red-600'}`}>
                                {chk.academy_members?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                             </div>
                             <span className="text-sm font-bold">{chk.academy_members?.display_name || 'HLV'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                            {chk.created_at ? new Date(chk.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                       </div>
                       <p className="text-xs text-slate-400 mb-2 truncate">Lớp: {chk.schedules?.classes?.name || 'N/A'}</p>
                       
                       {!chk.is_valid && chk.notes && (
                         <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] p-2 rounded-lg font-medium mb-3 italic">
                           Khung giải trình: &quot;{chk.notes}&quot;
                         </div>
                       )}

                       <div className="flex items-center justify-between mt-auto">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${chk.is_valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                             {chk.is_valid ? '✓ Hợp lệ' : '⚠ Cảnh báo GPS'}
                          </span>
                          {!chk.is_valid && <OverrideCheckinButton checkinId={chk.id} />}
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                   <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">Đang chờ tín hiệu...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
