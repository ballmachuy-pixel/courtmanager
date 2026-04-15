import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { AttendanceGridClient } from './components/AttendanceGridClient';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { getICTDateString } from '@/lib/utils';
import { cookies } from 'next/headers';
import { verifyCoachSession } from '@/lib/auth-utils';
import { createAdminClient } from '@/lib/supabase/service';

export default async function CoachClassAttendancePage({ params }: { params: { id: string } }) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/login');

  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  
  if (!token) redirect('/login');

  const coachSession = await verifyCoachSession(token);
  if (!coachSession || coachSession.role !== 'coach') redirect('/login');

  const supabase = createAdminClient();
  let classId = params.id;

  // SMART FALLBACK: If ID is 'today' or isn't a valid UUID, find the first active class for this coach today
  if (classId === 'today' || classId.length < 32) {
    const todayDay = getDayOfWeekICT();
    const { data: activeSchedule } = await supabase
      .from('schedules')
      .select('class_id')
      .eq('day_of_week', todayDay)
      .eq('coach_id', coachSession.member_id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (activeSchedule) {
      classId = activeSchedule.class_id;
    }
  }

  const { data: classData } = await supabase
    .from('classes')
    .select('*, schedules(*)')
    .eq('id', classId)
    .single();

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
          <Users size={28} className="text-red-400" />
        </div>
        <p className="text-white font-bold mb-2">Không tìm thấy lớp học</p>
        <p className="text-slate-500 text-[10px] font-mono opacity-50">ID: {classId}</p>
        <Link href="/coach" className="mt-8 text-pink-500 text-sm font-bold bg-pink-500/10 px-6 py-2 rounded-full border border-pink-500/20">
          Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  const { data: studentClasses } = await supabase
    .from('student_classes')
    .select('students(id, full_name, avatar_url)')
    .eq('class_id', classId);

  const students = (studentClasses || []).map(sc => sc.students).filter(s => s !== null) as any[];

  const dateStr = getICTDateString();
  const { data: attendances } = await supabase
    .from('attendances')
    .select('student_id, status')
    .eq('class_id', classId)
    .eq('date', dateStr);

  return (
    <div className="animate-in flex flex-col gap-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/coach" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">{classData.name}</h1>
          <p className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
            <Users size={14} /> {students.length} học viên
          </p>
        </div>
      </div>

      {/* Date Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
            <Calendar size={16} />
          </div>
          <span className="text-sm font-bold text-white">Ngày điểm danh: {dateStr.split('-').reverse().join('/')}</span>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          Chạm để đánh dấu điểm danh. Phụ huynh sẽ nhận thông báo tự động.
        </p>
      </div>

      <AttendanceGridClient 
        classId={classId} 
        students={students} 
        initialAttendances={attendances || []} 
      />
    </div>
  );
}
