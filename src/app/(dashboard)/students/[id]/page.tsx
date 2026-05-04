import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Edit, ExternalLink, Calendar, 
  ChevronRight, CheckCircle, AlertCircle, Copy, Check, Sparkles, TrendingUp, CreditCard
} from 'lucide-react';
import { formatDate, calculateAge, SKILL_LABELS, RELATIONSHIP_LABELS } from '@/lib/utils';
import { APP_URL } from '@/lib/constants';
import { Student, Attendance, Class } from '@/types/database';
import DeleteStudentButton from './DeleteStudentButton';
import AvatarUpload from './components/AvatarUpload';

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      *,
      parents(id, full_name, phone, access_token)
    `)
    .eq('id', params.id)
    .eq('academy_id', academyId)
    .single();

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
           <AlertCircle size={40} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy học viên</h3>
        <p className="text-slate-500 mb-8">Học viên không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link href="/students" className="btn btn-secondary px-8">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Fetch related data with proper typing (partial inference from Supabase)
  const [{ data: studentClasses }, { data: attendances }, { count: totalAttendedCount }] = await Promise.all([
    supabase
      .from('student_classes')
      .select('*, classes(id, name, age_group)')
      .eq('student_id', params.id),
    supabase
      .from('attendances')
      .select('*, classes(name)')
      .eq('student_id', params.id)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('attendances')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', params.id)
      .eq('status', 'present')
  ]);

  const totalSessions = totalAttendedCount || 0;
  const packageSize = 36; // 36 sessions per package
  const currentPackageSessions = totalSessions % packageSize;
  const isNearPayment = currentPackageSessions >= 32; // If they have attended 32-35 sessions, it's time to pay soon
  
  const parent = student.parents;
  const parentPortalUrl = parent ? `${APP_URL}/parent/${parent.access_token}` : null;
  const relationshipLabel = RELATIONSHIP_LABELS[student.parent_relationship as keyof typeof RELATIONSHIP_LABELS] || student.parent_relationship;

  return (
    <div className="student-detail-v2 animate-in space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-6">
          <Link href="/students" className="w-12 h-12 glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div className="flex items-center gap-5">
            <AvatarUpload studentId={student.id} currentAvatarUrl={student.avatar_url} />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">{student.full_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${student.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                   {student.is_active ? 'Học viên chính thức' : 'Đã tạm nghỉ'}
                </span>
              </div>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                <span>{student.date_of_birth ? `${calculateAge(student.date_of_birth)} tuổi` : 'Chưa cập nhật tuổi'}</span>
                <span className="text-slate-700">•</span>
                <span>Trình độ: {student.skill_level ? (SKILL_LABELS[student.skill_level as keyof typeof SKILL_LABELS] || student.skill_level) : 'Chưa cập nhật'}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/students/${params.id}/edit`} className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/5">
              <Edit size={18} />
              <span className="hidden sm:inline">Sửa thông tin</span>
           </Link>
           <DeleteStudentButton studentId={student.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* --- LEFT: INFO BLOCKS --- */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card p-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Thông tin học vụ</h3>
              <div className="space-y-5">
                 <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-slate-400">Giới tính</span>
                    <span className="text-sm font-bold text-white">{student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                 </div>
                 <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-slate-400">Ngày sinh</span>
                    <span className="text-sm font-bold text-white">{student.date_of_birth ? formatDate(student.date_of_birth) : '-'}</span>
                 </div>
                 <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-slate-400">Ngày nhập học</span>
                    <span className="text-sm font-bold text-white">{formatDate(student.created_at)}</span>
                 </div>
                 {student.health_notes && (
                   <div className="pt-3 border-t border-white/5">
                      <span className="text-[10px] font-black text-amber-500 uppercase mb-2 block">Ghi chú sức khỏe</span>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{student.health_notes}"</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="glass-card p-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Thông tin Phụ huynh</h3>
              {parent ? (
                <div className="space-y-6">
                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center font-bold">
                         {parent.full_name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{relationshipLabel}</p>
                         <p className="font-bold text-white">{parent.full_name}</p>
                      </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Số điện thoại</span>
                      <a href={`tel:${parent.phone}`} className="text-sm font-bold text-pink-500">{parent.phone}</a>
                   </div>

                   <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Link Cổng thông tin riêng</p>
                      <div className="flex gap-2">
                         <a href={parentPortalUrl || '#'} target="_blank" className="flex-1 bg-white/5 text-slate-300 py-3 rounded-xl text-center text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                           <ExternalLink size={14} /> Mở cổng PH
                         </a>
                         <button className="bg-white/5 text-slate-300 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Copy size={14} />
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
                   <p className="text-xs text-slate-600 font-bold uppercase">Chưa gán hồ sơ phụ huynh</p>
                </div>
              )}
           </div>
        </div>

        {/* --- RIGHT: DATA BLOCKS --- */}
        <div className="lg:col-span-8 space-y-8">
           {/* --- REVENUE & VIP TRACKING --- */}
           <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold flex items-center gap-3">
                    <TrendingUp size={20} className="text-amber-500" />
                    <span>Tiến độ Gói Học Phí</span>
                 </h3>
                 {isNearPayment && (
                   <span className="animate-pulse bg-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-red-500/30">
                     Sắp hết hạn
                   </span>
                 )}
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Đã học gói hiện tại</p>
                    <p className="text-2xl font-black text-white mt-1">
                      {currentPackageSessions} <span className="text-sm text-slate-500 font-medium">/ {packageSize} buổi</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Còn lại</p>
                    <p className={`text-xl font-black mt-1 ${isNearPayment ? 'text-red-400' : 'text-emerald-400'}`}>
                      {packageSize - currentPackageSessions} <span className="text-xs text-slate-500 font-medium">buổi</span>
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full ${isNearPayment ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-teal-400'}`}
                    style={{ width: `${(currentPackageSessions / packageSize) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Tổng Tích Lũy Trọn Đời</p>
                  <p className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Sparkles size={16} /> {totalSessions} buổi
                  </p>
                </div>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2 rounded-xl text-xs font-bold text-slate-300">
                  <CreditCard size={14} /> Gia hạn gói
                </button>
              </div>
           </div>

           <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold flex items-center gap-3">
                    <Calendar size={20} className="text-blue-500" />
                    <span>Các lớp tham gia</span>
                 </h3>
                 <button className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all">Ghi danh lớp mới</button>
              </div>

              {!studentClasses || studentClasses.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                   <p className="text-sm italic">Học viên chưa tham gia lớp nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {studentClasses.map((sc: any) => (
                      <div key={sc.class_id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                         <div>
                            <p className="font-bold text-lg group-hover:text-blue-400 transition-colors">{sc.classes?.name}</p>
                            <p className="text-xs text-slate-500">Độ tuổi: {sc.classes?.age_group || 'Chung'}</p>
                         </div>
                         <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                      </div>
                   ))}
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* --- ATTENDANCE HISTORY --- */}
              <div className="glass-card p-6">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-500" />
                    <span>Điểm danh gần đây</span>
                 </h3>
                 {!attendances || attendances.length === 0 ? (
                    <p className="text-sm text-slate-600 italic">Chưa có dữ liệu</p>
                 ) : (
                    <div className="space-y-4">
                       {attendances.map((att: any) => (
                          <div key={att.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                             <div>
                                <p className="text-xs font-bold text-white">{formatDate(att.date)}</p>
                                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{att.classes?.name}</p>
                             </div>
                             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                att.status === 'present' ? 'text-emerald-500 bg-emerald-500/10' : 
                                att.status === 'absent' ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10'
                             }`}>
                                {att.status === 'present' ? 'CÓ MẶT' : att.status === 'absent' ? 'VẮNG' : 'MUỘN'}
                             </span>
                          </div>
                       ))}
                    </div>
                 )}
              </div>


           </div>
        </div>
      </div>
    </div>
  );
}
