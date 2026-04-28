'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock, Loader2, FileText, MapPin } from 'lucide-react';
import { markAttendance, markAttendanceBulk } from '@/app/actions/coach';

interface Student {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

interface Props {
  classId: string;
  scheduleId: string;
  students: Student[];
  initialAttendances: AttendanceRecord[];
  isCheckedIn: boolean;
}

export function AttendanceGridClient({ classId, scheduleId, students, initialAttendances, isCheckedIn }: Props) {
  const [attendances, setAttendances] = useState<Record<string, string>>(() => {
    const acc: Record<string, string> = {};
    initialAttendances.forEach(a => {
      acc[a.student_id] = a.status;
    });
    return acc;
  });

  const [loadingObj, setLoadingObj] = useState<Record<string, boolean>>({});
  const [isBulkMarking, setIsBulkMarking] = useState(false);

  // Chặn thao tác nếu chưa check-in
  if (!isCheckedIn) {
    return (
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 animate-in">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
           <MapPin size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">Bạn chưa điểm danh vào lớp</h3>
          <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed font-medium">
            Vui lòng quay lại trang chủ và thực hiện <b>Điểm danh (Check-in)</b> tại sân để kích hoạt quyền điểm danh học sinh.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/coach'}
          className="bg-white text-slate-950 font-black px-8 py-3 rounded-full text-sm active:scale-95 transition-transform"
        >
          QUAY LẠI TRANG CHỦ
        </button>
      </div>
    );
  }

  const handleMark = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    if ('vibrate' in navigator) navigator.vibrate(40);
    setAttendances(prev => ({...prev, [studentId]: status}));
    setLoadingObj(prev => ({...prev, [studentId]: true}));
    
    try {
      await markAttendance({ classId, scheduleId, studentId, status });
    } catch (err) {
      console.error(err);
      setAttendances(prev => {
        const next = {...prev};
        delete next[studentId];
        return next;
      });
    } finally {
      setLoadingObj(prev => ({...prev, [studentId]: false}));
    }
  };

  const handleMarkAllPresent = async () => {
    const unmarkedStudents = students.filter(s => !attendances[s.id]);
    if (unmarkedStudents.length === 0) return;

    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    setIsBulkMarking(true);
    const unmarkedIds = unmarkedStudents.map(s => s.id);

    setAttendances(prev => {
      const next = { ...prev };
      unmarkedIds.forEach(id => { next[id] = 'present'; });
      return next;
    });

    try {
      await markAttendanceBulk({ classId, scheduleId, studentIds: unmarkedIds, status: 'present' });
    } catch (err) {
      console.error(err);
      setAttendances(prev => {
        const next = { ...prev };
        unmarkedIds.forEach(id => { delete next[id]; });
        return next;
      });
      alert('Đã xảy ra lỗi khi điểm danh hàng loạt');
    } finally {
      setIsBulkMarking(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk Mark All */}
      {students.length > 0 && (
        <button 
          onClick={handleMarkAllPresent}
          disabled={isBulkMarking || students.every(s => attendances[s.id])}
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-5 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-emerald-500/5"
        >
          {isBulkMarking ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
          {isBulkMarking ? 'Đang lưu...' : 'ĐIỂM DANH TẤT CẢ CÓ MẶT'}
        </button>
      )}

      {/* Student List */}
      <div className="space-y-3">
        {students.map(student => {
          const studentStatus = attendances[student.id];
          const isProcessing = loadingObj[student.id];
          
          return (
            <div key={student.id} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-4 flex flex-col gap-4 hover:border-white/20 transition-all shadow-xl">
              <div className="flex items-center gap-4">
                {/* Avatar with next/image */}
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                  {student.avatar_url ? (
                    <Image 
                      src={student.avatar_url} 
                      alt={student.full_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <span className="text-2xl font-black text-white/30">{student.full_name.charAt(0)}</span>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-[2px]">
                      <Loader2 size={20} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-white text-base truncate">{student.full_name}</h4>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                    {studentStatus ? `Trạng thái: ${
                      studentStatus === 'present' ? 'Có mặt' : 
                      studentStatus === 'absent' ? 'Vắng mặt' : 
                      studentStatus === 'late' ? 'Đi muộn' : 'Có phép'
                    }` : 'Chưa điểm danh'}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons - Increased size for mobile */}
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => handleMark(student.id, 'present')}
                  disabled={isProcessing}
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 ${
                    studentStatus === 'present' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                      : 'bg-white/5 text-slate-500 border border-white/5'
                  }`}
                >
                  <CheckCircle size={20} />
                  <span className="text-[9px] font-black uppercase">Có mặt</span>
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'absent')}
                  disabled={isProcessing}
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 ${
                    studentStatus === 'absent' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 text-slate-500 border border-white/5'
                  }`}
                >
                  <XCircle size={20} />
                  <span className="text-[9px] font-black uppercase">Vắng</span>
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'late')}
                  disabled={isProcessing}
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 ${
                    studentStatus === 'late' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10' 
                      : 'bg-white/5 text-slate-500 border border-white/5'
                  }`}
                >
                  <Clock size={20} />
                  <span className="text-[9px] font-black uppercase">Muộn</span>
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'excused')}
                  disabled={isProcessing}
                  className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-90 ${
                    studentStatus === 'excused' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10' 
                      : 'bg-white/5 text-slate-500 border border-white/5'
                  }`}
                >
                  <FileText size={20} />
                  <span className="text-[9px] font-black uppercase">Phép</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
