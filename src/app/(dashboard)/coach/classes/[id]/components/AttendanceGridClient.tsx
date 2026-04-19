'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, FileText } from 'lucide-react';
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
  isCheckedIn: boolean; // [MỚI] Yêu cầu check-in trước khi làm việc
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
    <div className="flex flex-col gap-3">
      {/* Bulk Mark All */}
      {students.length > 0 && (
        <button 
          onClick={handleMarkAllPresent}
          disabled={isBulkMarking || students.every(s => attendances[s.id])}
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {isBulkMarking ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
          {isBulkMarking ? 'Đang lưu...' : 'ĐIỂM DANH TẤT CẢ CÓ MẶT'}
        </button>
      )}

      {/* Student Grid */}
      {students.map(student => {
        const studentStatus = attendances[student.id];
        const isProcessing = loadingObj[student.id];
        
        return (
          <div key={student.id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {student.avatar_url ? (
                <img src={student.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-xl font-black text-white/30">{student.full_name.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm truncate mb-2">{student.full_name}</h4>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleMark(student.id, 'present')}
                  disabled={isProcessing}
                  title="Có mặt"
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    studentStatus === 'present' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner' 
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400'
                  }`}
                >
                  <CheckCircle size={16} />
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'absent')}
                  disabled={isProcessing}
                  title="Vắng không phép"
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    studentStatus === 'absent' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-inner' 
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-red-500/10 hover:text-red-400'
                  }`}
                >
                  <XCircle size={16} />
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'late')}
                  disabled={isProcessing}
                  title="Đi trễ"
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    studentStatus === 'late' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner' 
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-amber-500/10 hover:text-amber-400'
                  }`}
                >
                  <Clock size={16} />
                </button>

                <button 
                  onClick={() => handleMark(student.id, 'excused')}
                  disabled={isProcessing}
                  title="Vắng có phép"
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                    studentStatus === 'excused' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner' 
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-purple-500/10 hover:text-purple-400'
                  }`}
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
