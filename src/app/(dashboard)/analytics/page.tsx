import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { Users, TrendingUp, AlertCircle, Calendar, UserCheck, BookOpen, Sparkles } from 'lucide-react';
import { formatCurrency, getICTDateString } from '@/lib/utils';
import AtRiskStudentsTable from '@/components/analytics/AtRiskStudentsTable';

export default async function AnalyticsPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = getICTDateString();

  // Parallel fetch all real data
  const [
    { count: totalStudents },
    { count: totalClasses },
    { count: attendancesToday },
    { count: absentToday },
    { data: studentGrowthData },
    { data: attendanceHistory },
    { data: absentThisMonthData },
  ] = await Promise.all([
    // Total active students
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('is_active', true),
    // Total classes
    supabase.from('classes').select('*', { count: 'exact', head: true }).eq('academy_id', academyId),
    // Attendance today (present + late)
    supabase.from('attendances').select('*, classes!inner(academy_id)', { count: 'exact', head: true }).eq('classes.academy_id', academyId).eq('date', todayStr).in('status', ['present', 'late']),
    // Absent today
    supabase.from('attendances').select('*, classes!inner(academy_id)', { count: 'exact', head: true }).eq('classes.academy_id', academyId).eq('date', todayStr).eq('status', 'absent'),
    // Student growth (created_at)
    supabase.from('students').select('created_at').eq('academy_id', academyId).gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
    // Attendance history for trends
    supabase.from('attendances').select('status, date').eq('academy_id', academyId).gte('date', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]),
    // Absent this month for At-Risk calculation
    supabase.from('attendances').select('student_id, date, students(full_name)').eq('academy_id', academyId).eq('status', 'absent').gte('date', firstDayOfMonth),
  ]);

  const totalAttendance = (attendancesToday || 0) + (absentToday || 0);
  const attendanceRate = totalAttendance > 0 ? Math.round(((attendancesToday || 0) / totalAttendance) * 100) : 0;

  // Build monthly growth and attendance data
  const monthNames = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const chartData: { month: string; students: number; attendance: number }[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const mStudents = studentGrowthData?.filter(s => s.created_at.startsWith(mKey)).length || 0;
    
    const mAttendances = attendanceHistory?.filter(a => a.date.startsWith(mKey)) || [];
    const mPresent = mAttendances.filter(a => ['present', 'late'].includes(a.status)).length;
    const mTotal = mAttendances.length;
    const mRate = mTotal > 0 ? Math.round((mPresent / mTotal) * 100) : 0;

    chartData.push({ 
      month: monthNames[d.getMonth()], 
      students: mStudents,
      attendance: mRate
    });
  }

  const maxGrowth = Math.max(...chartData.map(d => d.students), 1);

  // Process At-Risk Students
  const absentMap: Record<string, { count: number; name: string; lastDate: string }> = {};
  
  absentThisMonthData?.forEach((a: any) => {
    const studentName = (Array.isArray(a.students) ? a.students[0] : a.students)?.full_name || 'Không rõ';
    if (!absentMap[a.student_id]) {
      absentMap[a.student_id] = { count: 0, name: studentName, lastDate: a.date };
    }
    absentMap[a.student_id].count++;
    if (a.date > absentMap[a.student_id].lastDate) {
      absentMap[a.student_id].lastDate = a.date;
    }
  });

  const atRiskStudents = Object.entries(absentMap)
    .filter(([_, data]) => data.count >= 2)
    .map(([id, data]) => ({
      student_id: id,
      name: data.name,
      absent_count: data.count,
      last_absent_date: data.lastDate
    }))
    .sort((a, b) => b.absent_count - a.absent_count);

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
            <Sparkles size={10} /> Phân tích vận hành chuyên sâu
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Phân Tích & Hiệu Suất</h1>
          <p className="text-slate-400 font-medium">Góc nhìn chuyên môn về sự tăng trưởng và độ chuyên cần của học viên</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng học viên', value: String(totalStudents || 0), icon: Users, color: 'blue', sub: 'Đang hoạt động' },
          { label: 'Số lớp vận hành', value: String(totalClasses || 0), icon: BookOpen, color: 'purple', sub: 'Đang mở cửa' },
          { label: 'Chuyên cần hôm nay', value: `${attendanceRate}%`, icon: UserCheck, color: attendanceRate >= 80 ? 'emerald' : 'amber', sub: `${attendancesToday || 0}/${totalAttendance} có mặt` },
          { label: 'Học viên mới', value: String(chartData[5].students), icon: TrendingUp, color: 'emerald', sub: 'Trong tháng này' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
              stat.color === 'red' ? 'bg-red-500/10 text-red-400' :
              stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
              'bg-purple-500/10 text-purple-400'
            }`}>
              <stat.icon size={20} />
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">{stat.label}</div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-600 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Growth Chart (Student Growth per Month) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <TrendingUp size={20} className="text-white" />
              </div>
              Tăng trưởng học viên mới
            </h3>

            <div className="flex items-end gap-3 md:gap-6 h-48 mb-4">
              {chartData.map((d, i) => {
                const height = maxGrowth > 0 ? Math.max((d.students / maxGrowth) * 100, 5) : 5;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[10px] text-slate-400 font-bold">{d.students}</div>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all relative group/bar cursor-default shadow-lg shadow-blue-500/10"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-[10px] text-slate-500 font-bold">{d.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <UserCheck size={20} className="text-white" />
              </div>
              Tỷ lệ chuyên cần (%)
            </h3>

            <div className="flex items-end gap-3 md:gap-6 h-48 mb-4">
              {chartData.map((d, i) => {
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[10px] text-slate-400 font-bold">{d.attendance}%</div>
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all relative group/bar cursor-default shadow-lg shadow-emerald-500/10"
                      style={{ height: `${d.attendance || 2}%` }}
                    />
                    <div className="text-[10px] text-slate-500 font-bold">{d.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* At Risk Students Report */}
      <AtRiskStudentsTable students={atRiskStudents} />
    </div>
  );
}
