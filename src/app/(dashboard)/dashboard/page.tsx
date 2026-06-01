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
import RemindCoachButton from '@/components/dashboard/RemindCoachButton';
import { AcademyService } from '@/lib/services/academy.service';
import ManagementHub from '@/components/dashboard/ManagementHub';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { getDashboardAnalytics } from '@/app/actions/attendance';
import { StudentService } from '@/lib/services/student.service';
import { Academy, Student, Class, Schedule, StaffCheckin } from '@/types/database';
import { FinanceService } from '@/lib/services/finance.service';
import TopVIPStudents from '@/components/dashboard/TopVIPStudents';
import { getPendingActionItemsAction } from '@/app/actions/action-items';
import CSKHActionWidget from '@/components/dashboard/CSKHActionWidget';
import DashboardSchedulesClient from '@/components/dashboard/DashboardSchedulesClient';
import ShiftHandoverModal from '@/components/dashboard/ShiftHandoverModal';
import { getLatestShiftLog } from '@/app/actions/shift-log';

export const dynamic = 'force-dynamic';

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
  let vipStudents: any[] = [];
  let schedulesWithAttendance = new Set<string>();
  let schedulesWithCheckin = new Set<string>();
  let financeSummary: any = null;
  let pendingActionItems: any[] = [];
  let latestShiftLog: any = null;
  let scheduleStats: Record<string, { total: number, marked: number }> = {};
  let cancellations: any[] = [];
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  const todayStr = getICTDateString();
  const todayStart = getICTStartOfDayUTC();

  try {
    const results = await Promise.all([
      supabase.from('academies').select('name').eq('id', academyId).single(),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
      supabaseAdmin.from('attendances').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('date', todayStr).eq('status', 'absent'),
      supabaseAdmin.from('staff_checkins').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).gte('created_at', todayStart.toISOString()).eq('is_valid', false),
      supabaseAdmin.from('attendances').select('schedule_id, status').eq('academy_id', academyId).eq('date', todayStr),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'overdue'),
      supabase.from('academy_members').select('*').eq('academy_id', academyId).eq('is_active', true),
      getDashboardAnalytics(),
      new StudentService(academyId).getTopVIPStudents(5),
      new FinanceService(academyId).getFinanceSummary(),
      getPendingActionItemsAction(),
      getLatestShiftLog(),
      supabase.from('class_cancellations').select('schedule_id, reason').eq('academy_id', academyId).eq('date', todayStr)
    ]);

    academy = results[0].data as Academy | null;
    studentCount = results[1].count || 0;
    classCount = results[2].count || 0;
    absentCount = results[3].count || 0;
    invalidCheckinsCount = results[4].count || 0;
    const attendanceData = (results[5].data || []) as any[];
    const paymentResCount = (results[6] as any)?.count || 0;
    const membersResData = results[7].data || [];
    chartData = results[8] as any[];
    vipStudents = (results[9] as any)?.data || [];
    financeSummary = (results[10] as any)?.data || null;
    pendingActionItems = (results[11] as any)?.data || [];
    latestShiftLog = results[12];
    cancellations = (results[13]?.data || []) as any[];
    
    // Combine overdue counts
    overduePaymentCount = paymentResCount + (financeSummary?.overdueCount || 0);

    // Logic mới v2.0: Phân tích điểm danh thực tế
    totalAttendanceToday = attendanceData.filter(a => ['present', 'late'].includes(a.status)).length;
    
    // Đếm số ca đã có điểm danh
    schedulesWithAttendance = new Set(attendanceData.map(a => a.schedule_id));

    allCoaches = membersResData.filter((m: any) => ['coach', 'admin', 'owner'].includes(m.role)) || [];

    const supabaseSession = await createClient();
    const { data: authUser } = await supabaseSession.auth.getUser();
    userId = authUser?.user?.id;

    if (userId) {
      currentUserMember = membersResData.find((m: any) => m.user_id === userId);
    }

    // Today's schedule 
    const todayDayOfWeek = getDayOfWeekICT();
    const { data: todaySchedulesData } = await supabaseAdmin
      .from('schedules')
      .select('*, classes!inner(name, academy_id, head_coach_id)')
      .eq('classes.academy_id', academyId)
      .eq('day_of_week', todayDayOfWeek)
      .order('start_time', { ascending: true });

    let rawSchedules = (todaySchedulesData as unknown as any[]) || [];
    todaySchedules = rawSchedules;

    // Fetch total students for these classes
    const classIds = Array.from(new Set(todaySchedules.map(s => s.class_id).filter(Boolean)));
    const { data: studentClassesData } = await supabaseAdmin
      .from('student_classes')
      .select('class_id')
      .in('class_id', classIds);
      
    const studentClasses = studentClassesData || [];
    
    // Calculate progress for each schedule
    todaySchedules.forEach(schedule => {
      const total = studentClasses.filter(sc => sc.class_id === schedule.class_id).length;
      const marked = attendanceData.filter(a => a.schedule_id === schedule.id).length;
      scheduleStats[schedule.id] = { total, marked };
    });

    // Staff checkins - Lấy để tính số ca "Đã bắt đầu"
    const { data: todayCheckinsData, error: checkinErr } = await supabaseAdmin
      .from('staff_checkins')
      .select('*, academy_members(display_name), schedules(classes(name))')
      .eq('academy_id', academyId)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    if (checkinErr) console.error("Checkin fetch error:", checkinErr);

    todayCheckins = (todayCheckinsData as unknown as CheckinWithDetails[]) || [];

    // Logic thống kê ca học thực tế
    schedulesWithCheckin = new Set(todayCheckins.map(c => c.schedule_id).filter(id => !!id));
    
    // Ca đã bắt đầu = có checkin HOẶC có điểm danh
    activeSchedulesCount = new Set([...Array.from(schedulesWithCheckin), ...Array.from(schedulesWithAttendance)]).size;
    
    // Ca "Chưa điểm danh" = Đã có HLV checkin nhưng chưa có học sinh nào được điểm danh
    unmarkedSessionsCount = Array.from(schedulesWithCheckin).filter(id => !schedulesWithAttendance.has(id)).length;
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
          <div className="flex-shrink-0">
             <ShiftHandoverModal unresolvedAlertsCount={(invalidCheckinsCount || 0) + (pendingActionItems.length || 0)} />
          </div>
        </div>

        {/* ══ TRIAGE MATRIX (RED ZONE) ══ */}
        {(invalidCheckinsCount > 0 || pendingActionItems.length > 0 || latestShiftLog) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(invalidCheckinsCount > 0 || pendingActionItems.length > 0) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={24} className="text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-red-400 font-black text-lg uppercase tracking-widest mb-1">Khu Vực Báo Động</h3>
                    <p className="text-red-300/70 text-xs mb-3">Cần ưu tiên xử lý ngay lập tức để không gián đoạn vận hành.</p>
                    <div className="flex flex-wrap gap-2">
                      {invalidCheckinsCount > 0 && (
                        <span className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                          <ShieldAlert size={14} /> {invalidCheckinsCount} GPS Không Hợp Lệ
                        </span>
                      )}
                      {pendingActionItems.length > 0 && (
                        <span className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                          <UserX size={14} /> {pendingActionItems.length} Hành Động CSKH Khẩn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {latestShiftLog && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Edit3 size={24} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest">Sổ Bàn Giao Ca Gần Nhất</h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatICTTime(latestShiftLog.created_at)}
                      </span>
                    </div>
                    <p className="text-indigo-200 text-sm italic border-l-2 border-indigo-500/30 pl-3 py-1 my-2 line-clamp-2">
                      &quot;{latestShiftLog.shift_note}&quot;
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      — Từ: {latestShiftLog.academy_members?.display_name || 'Quản lý'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
              overdueTuitionCount={financeSummary?.overdueCount || 0}
            />

            <AttendanceChart data={chartData} />

            <DashboardSchedulesClient 
              schedules={safeSchedules} 
              schedulesWithCheckin={Array.from(schedulesWithCheckin)} 
              schedulesWithAttendance={Array.from(schedulesWithAttendance)} 
              scheduleStats={scheduleStats}
              cancellations={cancellations}
              todayStr={todayStr}
            />
          </div>

        {/* RIGHT COLUMN (4 UNITS) - Staff Alerts & Brand */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <CSKHActionWidget initialItems={pendingActionItems} />
           
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
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-white">
                    {invalidCheckinsCount} CẢNH BÁO
                  </span>
                )}
              </h3>

              {safeCheckins.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {safeCheckins.map((chk) => (
                    <div key={chk.id} className={`p-4 rounded-xl border ${chk.is_valid ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/20'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg ${chk.is_valid ? 'bg-emerald-600' : 'bg-amber-600'}`}>
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
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${chk.is_valid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                             {chk.is_valid ? '✓ Hợp lệ' : '⚠ GPS CẢNH BÁO'}
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

            <TopVIPStudents students={vipStudents} />
          </div>
        </div>
      </div>
    </div>
  );
}
