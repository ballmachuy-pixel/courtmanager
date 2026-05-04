'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, MapPin, Search, X } from 'lucide-react';
import { markAttendance, markAttendanceBulk, unmarkAttendance } from '@/app/actions/coach';

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
      if (a.status === 'present' || a.status === 'late') {
        acc[a.student_id] = 'present';
      }
    });
    return acc;
  });

  const [loadingObj, setLoadingObj] = useState<Record<string, boolean>>({});
  const [isBulkMarking, setIsBulkMarking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleToggle = async (studentId: string) => {
    if ('vibrate' in navigator) navigator.vibrate(40);
    const isCurrentlyPresent = !!attendances[studentId];
    
    setAttendances(prev => {
      const next = {...prev};
      if (isCurrentlyPresent) {
        delete next[studentId];
      } else {
        next[studentId] = 'present';
      }
      return next;
    });
    
    setLoadingObj(prev => ({...prev, [studentId]: true}));
    
    try {
      if (isCurrentlyPresent) {
        await unmarkAttendance({ studentId, scheduleId });
      } else {
        await markAttendance({ classId, scheduleId, studentId, status: 'present' });
      }
    } catch (err) {
      console.error(err);
      setAttendances(prev => {
        const next = {...prev};
        if (isCurrentlyPresent) {
          next[studentId] = 'present';
        } else {
          delete next[studentId];
        }
        return next;
      });
      alert('Đã xảy ra lỗi, vui lòng thử lại');
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

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQ = searchQuery.toLowerCase();
    return students.filter(s => s.full_name.toLowerCase().includes(lowerQ));
  }, [students, searchQuery]);

  const presentStudents = filteredStudents.filter(s => attendances[s.id]);
  const absentStudents = filteredStudents.filter(s => !attendances[s.id]);

  return (
    <div className="flex flex-col gap-4">
      {students.length > 0 && absentStudents.length > 0 && !searchQuery && (
        <button 
          onClick={handleMarkAllPresent}
          disabled={isBulkMarking}
          className="w-full bg-emerald-500 text-white py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-emerald-500/20"
        >
          {isBulkMarking ? <Loader2 size={22} className="animate-spin" /> : <CheckCircle size={22} />}
          {isBulkMarking ? 'Đang lưu...' : `ĐIỂM DANH TẤT CẢ (${absentStudents.length} BÉ)`}
        </button>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm tên học sinh..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-white/10 text-white rounded-2xl pl-11 pr-10 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6 mt-2">
        {(absentStudents.length > 0 || searchQuery) && (
          <div className="space-y-3">
            {!searchQuery && <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider px-2">Chưa điểm danh ({absentStudents.length})</h3>}
            {absentStudents.map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                isPresent={false} 
                isProcessing={loadingObj[student.id]} 
                onToggle={() => handleToggle(student.id)} 
              />
            ))}
          </div>
        )}

        {presentStudents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider px-2 mt-4">Đã có mặt ({presentStudents.length})</h3>
            {presentStudents.map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                isPresent={true} 
                isProcessing={loadingObj[student.id]} 
                onToggle={() => handleToggle(student.id)} 
              />
            ))}
          </div>
        )}

        {filteredStudents.length === 0 && (
          <div className="text-center py-10 text-slate-500 font-medium">
            Không tìm thấy học sinh "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student, isPresent, isProcessing, onToggle }: { student: Student, isPresent: boolean, isProcessing: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      disabled={isProcessing}
      className={`w-full text-left rounded-[2rem] p-3 flex items-center justify-between transition-all active:scale-[0.98] border ${
        isPresent 
          ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
          : 'bg-slate-900/60 border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner ${isPresent ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
          {student.avatar_url ? (
            <Image 
              src={student.avatar_url} 
              alt={student.full_name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span className={`text-xl font-black ${isPresent ? 'text-emerald-500' : 'text-white/30'}`}>{student.full_name.charAt(0)}</span>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-[2px]">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}
        </div>
        
        <div>
          <h4 className={`font-black text-base ${isPresent ? 'text-emerald-400' : 'text-white'}`}>{student.full_name}</h4>
          <p className={`text-[11px] font-bold tracking-widest mt-0.5 uppercase ${isPresent ? 'text-emerald-500/70' : 'text-slate-500'}`}>
            {isPresent ? 'Có mặt' : 'Chưa điểm danh'}
          </p>
        </div>
      </div>

      <div className="pr-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPresent ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
          <CheckCircle size={18} strokeWidth={isPresent ? 3 : 2} />
        </div>
      </div>
    </button>
  );
}
