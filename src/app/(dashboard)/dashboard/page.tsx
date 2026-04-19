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
import { formatDate, getICTDateString, getICTStartOfDayUTC, getDayOfWeekICT, formatICTTime } from '@/lib/utils';
import OverrideCheckinButton from '@/components/dashboard/OverrideCheckinButton';
import AdminManualCheckinButton from '@/components/dashboard/AdminManualCheckinButton';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import ManagementHub from '@/components/dashboard/ManagementHub';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { getDashboardAnalytics } from '@/app/actions/attendance';
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
  let currentUserMember: any = null;
  let allCoaches: any[] = [];
  let activeSchedulesCount = 0;
  let unmarkedSessionsCount = 0;
  let chartData: any[] = [];

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
      membersRes,
    ] = await Promise.all([
      supabase.from('academies').select('name').eq('id', academyId).single(),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      supabase.from('attendances').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('date', todayStr).eq('status', 'absent'),
      supabase.from('staff_checkins').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', todayStart.toISOString()).eq('is_valid', false),
      supabase.from('attendances').select('schedule_id, status').eq('academy_id', academyId).eq('date', todayStr),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'overdue'),
      supabase.from('academy_members').select('*').eq('academy_id', academyId).eq('is_active', true),
      getDashboardAnalytics(),
    ]);

    academy = academyRes.data as Academy | null;
    studentCount = studentRes.count || 0;
    classCount = classRes.count || 0;
    absentCount = absentRes.count || 0;
    invalidCheckinsCount = invalidRes.count || 0;
    chartData = chartRes as any[];
    
    // Logic mới v2.0: Phân tích điểm danh thực tế
    const attendanceData = (attendanceRes.data || []) as any[];
    totalAttendanceToday = attendanceData.filter(a => ['present', 'late'].includes(a.status)).length;
    
    // Đếm số ca đã có điểm danh
    const schedulesWithAttendance = new Set(attendanceData.map(a => a.schedule_id));

    overduePaymentCount = (paymentRes as any)?.count || 0;
    allCoaches = membersRes.data?.filter((m: any) => ['coach', 'admin', 'owner'].includes(m.role)) || [];

    const supabaseSession = await createClient();
    const { data: authUser } = await supabaseSession.auth.getUser();
    userId = authUser?.user?.id;

    if (userId) {
      currentUserMember = membersRes.data?.find((m: any) => m.user_id === userId);
    }

    // Today's schedule 
    const todayDayOfWeek = getDayOfWeekICT();
    const { data: todaySchedulesData } = await supabase
      .from('schedules')
      .select('*, classes!inner(name, academy_id, head_coach_id)')
      .eq('classes.academy_id', academyId)
      .eq('day_of_week', todayDayOfWeek)
      .order('start_time', { ascending: true });

    let rawSchedules = (todaySchedulesData as unknown as any[]) || [];
    todaySchedules = rawSchedules;

    // Staff checkins - Lấy để tính số ca "Đã bắt đầu"
    const { data: todayCheckinsData } = await supabase
      .from('staff_checkins')
      .select('*, academy_members!staff_checkins_coach_id_fkey(display_name), schedules(classes(name))')
      .eq('academy_id', academyId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    todayCheckins = (todayCheckinsData as unknown as CheckinWithDetails[]) || [];

    // Logic thống kê ca học thực tế
    const schedulesWithCheckin = new Set(todayCheckins.map(c => c.schedule_id).filter(id => !!id));
    
    // Ca đã bắt đầu = có checkin HOẶC có điểm danh
    const activeSchedulesCount = new Set([...Array.from(schedulesWithCheckin), ...Array.from(schedulesWithAttendance)]).size;
    
    // Ca "Chưa điểm danh" = Đã có HLV checkin nhưng chưa có học sinh nào được điểm danh
    const unmarkedSessionsCount = Array.from(schedulesWithCheckin).filter(id => !schedulesWithAttendance.has(id)).length;
    } catch (err) {
      console.error('[DashboardPage] Data fetch error:', err);
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

        {/* ══ MAIN GRID LAYOUT (2 COLUMNS) ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* LEFT COLUMN (8 UNITS) - Operations & Tiles */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ManagementHub
              todayScheduleCount={safeSchedules.length}
              invalidCheckinsCount={invalidCheckinsCount || 0}
              totalAttendanceToday={totalAttendanceToday || 0}
              studentCount={studentCount || 0}
              overduePaymentCount={overduePaymentCount || 0}
              classCount={classCount || 0}
              activeSessionsCount={activeSchedulesCount}
              unmarkedSessionsCount={unmarkedSessionsCount}
            />

            <AttendanceChart data={chartData} />

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold flex items-center gap-3">
                 <Calendar size={22} className="text-pink-500" />
                 <span>Lịch học hôm nay</span>
               </h3>
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                   Tổng: {safeSchedules.length} ca
                 </span>
                 <Link href="/attendance" className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1">
                   Tất cả lịch <ExternalLink size={12}/>
                 </Link>
               </div>
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
                        <h4 className="font-bold text-base group-hover:text-pink-400 transition-colors line-clamp-1">{schedule.classes?.name || 'Lớp học'}</h4>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin size={10} /> {schedule.location || 'Sân tập'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block flex-1">
                      <h4 className="font-bold text-lg group-hover:text-pink-400 transition-colors">{schedule.classes?.name || 'Lớp học'}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {schedule.location || 'Sân vận động chính'}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">Kết thúc: {schedule.end_time?.substring(0, 5) || '--:--'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/attendance?sessionId=${schedule.id}`} className="bg-pink-600/10 text-pink-500 px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 hover:text-white transition-all whitespace-nowrap text-center">
                        Điểm danh
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Calendar className="text-slate-700" size={32} />
                 </div>
                 <p className="text-slate-500 text-sm">Hôm nay không có lịch tập nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (4 UNITS) - Staff Alerts & Brand */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* BRAND TILE */}
           <div className="glass-card p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-white/10 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                    <Sparkles size={20} />
                 </div>
                 <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Báo cáo trung tâm</h4>
                 <p className="text-slate-400 text-xs leading-relaxed font-medium mb-6">
                    Hệ thống đang vận hành ổn định. Các chỉ số được cập nhật theo thời gian thực (v2.0).
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <span>CourtManager</span>
                    <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                    <span>Admin Panel</span>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span>Check-in HLV</span>
                </div>
                {invalidCheckinsCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500 text-white animate-pulse">
                    {invalidCheckinsCount} LỖI
                  </span>
                )}
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
                          <span className="text-[10px] text-slate-500 font-medium font-mono">
                            {formatICTTime(chk.created_at)}
                          </span>
                       </div>
                       <p className="text-[10px] text-slate-400 mb-2 truncate font-medium uppercase tracking-wider">Mã ca: {chk.schedules?.classes?.name || 'N/A'}</p>
                       
                       <div className="flex items-center justify-between mt-auto">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${chk.is_valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                             {chk.is_valid ? '✓ Hợp lệ' : '⚠ GPS LỖI'}
                          </span>
                          {!chk.is_valid && <OverrideCheckinButton checkinId={chk.id} />}
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                   <p className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">Chưa có check-in nào</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
