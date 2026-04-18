import { redirect } from 'next/navigation';
import { getDayOfWeekICT, getICTStartOfDayUTC } from '@/lib/utils';
import { cookies } from 'next/headers';
import { verifyCoachSession } from '@/lib/auth-utils';
import { createAdminClient } from '@/lib/supabase/service';
import { CheckinButton } from './components/CheckinButton';
import { Calendar, User, MapPin, Clock, Sparkles } from 'lucide-react';

export default async function CoachDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  
  if (!token) return <div className="text-white p-8">LỖI: Cookie token không tồn tại. Điện thoại của bạn đã xóa cookie của hệ thống!</div>;

  const coachSession = await verifyCoachSession(token);
  if (!coachSession) return <div className="text-white p-8">LỖI: Xác thực Thẻ bài JWT thất bại. Chữ ký JWT không hợp lệ trên Server!</div>;
  if (coachSession.role !== 'coach') return <div className="text-white p-8">LỖI: Bạn không có quyền HLV. Quyền hiện tại: {coachSession.role}</div>;

  const supabase = createAdminClient();

  const { data: coachData, error: dbError } = await supabase
    .from('academy_members')
    .select('*, academies(name)')
    .eq('id', coachSession.member_id)
    .single();

  if (!coachData) {
    return <div className="text-white p-8">LỖI: Không tìm thấy dữ liệu HLV trong Database với ID {coachSession.member_id}. Lỗi: {JSON.stringify(dbError)}</div>;
  }

  const academyId = coachData.academy_id;

  const todayDayOfWeek = getDayOfWeekICT();
  
  // 1. Fetch schedules where coach is explicitly assigned
  const { data: assignedSchedules } = await supabase
    .from('schedules')
    .select('id, start_time, end_time, location, assigned_coach_id, classes!inner(id, name, head_coach_id)')
    .eq('day_of_week', todayDayOfWeek)
    .eq('assigned_coach_id', coachData.id)
    .neq('is_active', false);

  // 2. Fetch schedules where coach is Head Coach of the class (fallback)
  const { data: headCoachSchedules } = await supabase
    .from('schedules')
    .select('id, start_time, end_time, location, assigned_coach_id, classes!inner(id, name, head_coach_id)')
    .eq('day_of_week', todayDayOfWeek)
    .is('assigned_coach_id', null)
    .eq('classes.head_coach_id', coachData.id)
    .neq('is_active', false);

  // Merge results and remove duplicates
  const allSchedules = [
    ...(assignedSchedules || []),
    ...(headCoachSchedules || [])
  ].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

  const todaySchedules = Array.from(new Map(allSchedules.map(item => [item.id, item])).values());

  // [MỚI] Lấy các bản ghi check-in ngày hôm nay của HLV này
  const todayStart = getICTStartOfDayUTC();
  const { data: todayCheckins } = await supabase
    .from('staff_checkins')
    .select('*')
    .eq('coach_id', coachData.id)
    .gte('created_at', todayStart.toISOString());


  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20 max-w-2xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-pink-600 to-purple-700 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-pink-900/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white/80 uppercase tracking-wider mb-4">
            <Sparkles size={10} /> Giao diện Huấn Luyện Viên
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            Xin chào, Thầy {coachData?.display_name}!
          </h1>
          <p className="text-white/60 text-sm font-medium flex items-center gap-2">
            <User size={14} /> Sẵn sàng cho buổi tập hôm nay
          </p>
        </div>
      </div>

      {/* Today Schedule Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Calendar size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-black text-white">Lịch dạy hôm nay</h2>
      </div>

      {(!todaySchedules || todaySchedules.length === 0) ? (
        <div className="text-center py-16 px-4 bg-slate-900/30 rounded-[2rem] border border-white/5 border-dashed relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-white/5">
              <Calendar className="text-slate-600" size={28} />
            </div>
            <p className="text-slate-500 text-sm font-medium">Hôm nay thầy không có lịch dạy nào.</p>
            <p className="text-slate-600 text-xs mt-1">Nghỉ ngơi và chuẩn bị cho buổi tập tiếp theo nhé!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {todaySchedules.map((schedule: any) => {
            // Safe extraction of nested class object from !inner join
            const classData = Array.isArray(schedule.classes) ? schedule.classes[0] : schedule.classes;
            const targetClassId = classData?.id || schedule.class_id; 
            return (
              <div key={schedule.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
                <div className="bg-slate-950/50 rounded-[1.35rem] p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
                      <span className="text-[9px] text-white/70 uppercase font-black tracking-widest">Bắt đầu</span>
                      <span className="text-lg font-black">{schedule.start_time?.substring(0, 5)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-white text-xl mb-1">{classData?.name || 'Lớp học'}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} /> {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                        </span>
                        {schedule.location && (
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            <MapPin size={12} /> {schedule.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CheckinButton
                    academyId={academyId}
                    scheduleId={schedule.id}
                    classId={targetClassId}
                    className={classData?.name || 'Lớp học'}
                    currentCheckin={todayCheckins?.find(c => c.schedule_id === schedule.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
