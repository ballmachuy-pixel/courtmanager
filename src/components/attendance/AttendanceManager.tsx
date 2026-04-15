'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarIcon, Loader2, Check, X, Clock, FileText,
  CheckCircle2, AlertCircle, Circle, Filter
} from 'lucide-react';
import { getAttendanceData, markAttendance, getClassAttendanceSummary } from '@/app/actions/attendance';

type Status = 'present' | 'absent' | 'late' | 'excused';

interface ClassItem { id: string; name: string; schedules?: { day_of_week: number }[]; }
interface Student  { id: string; full_name: string; avatar_url: string | null; }
interface AttendanceRecord { student_id: string; status: Status; note: string | null; }
interface ClassProgress { classId: string; total: number; marked: number; }

// Status config
const STATUS_CONFIG = {
  present:  { label: 'Có mặt', icon: Check,     color: 'bg-emerald-500 text-white shadow-emerald-500/30', inactive: 'bg-slate-800 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5' },
  late:     { label: 'Muộn',   icon: Clock,     color: 'bg-amber-500 text-white shadow-amber-500/30',   inactive: 'bg-slate-800 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5' },
  excused:  { label: 'Có phép',icon: FileText,  color: 'bg-blue-500 text-white shadow-blue-500/30',    inactive: 'bg-slate-800 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 border border-white/5' },
  absent:   { label: 'Vắng',   icon: X,         color: 'bg-red-500 text-white shadow-red-500/30',      inactive: 'bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-white/5' },
} as const;

// ─── Tab badge ─────────────────────────────────────────────────────────────
function TabBadge({ marked, total }: { marked: number; total: number }) {
  if (total === 0) return null;
  if (marked === total) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
        <CheckCircle2 size={9} /> {marked}/{total}
      </span>
    );
  }
  if (marked > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
        <AlertCircle size={9} /> {marked}/{total}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[9px] font-black text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md">
      <Circle size={9} /> {marked}/{total}
    </span>
  );
}

// ─── Summary bar ───────────────────────────────────────────────────────────
function SummaryBar({ attendances, total }: { attendances: Record<string, AttendanceRecord>; total: number }) {
  const counts = { present: 0, late: 0, excused: 0, absent: 0 };
  for (const rec of Object.values(attendances)) {
    if (rec.status in counts) counts[rec.status as keyof typeof counts]++;
  }
  const marked = counts.present + counts.late + counts.excused + counts.absent;
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex-wrap">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mr-1 shrink-0">
        {marked}/{total} đã điểm danh
      </span>
      {counts.present > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
          <Check size={9} /> {counts.present} Có mặt
        </span>
      )}
      {counts.late > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
          <Clock size={9} /> {counts.late} Muộn
        </span>
      )}
      {counts.excused > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
          <FileText size={9} /> {counts.excused} Có phép
        </span>
      )}
      {counts.absent > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
          <X size={9} /> {counts.absent} Vắng
        </span>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function AttendanceManager({ classes }: { classes: ClassItem[] }) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [selectedDate,  setSelectedDate]  = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAllClasses, setShowAllClasses] = useState(false);

  const [students,    setStudents]    = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord>>({});
  const [progress,    setProgress]    = useState<ClassProgress[]>([]);

  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch class progress for all tabs when date changes
  const fetchProgress = useCallback(async (date: string) => {
    if (!classes.length) return;
    try {
      const data = await getClassAttendanceSummary(classes.map(c => c.id), date);
      setProgress(data);
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  // Fetch students + attendance for selected class/date
  useEffect(() => {
    if (!selectedClass || !selectedDate) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAttendanceData(selectedClass, selectedDate);
        setStudents(data.students);
        const map: Record<string, AttendanceRecord> = {};
        for (const att of data.attendances) {
          map[att.student_id] = { student_id: att.student_id, status: att.status, note: att.note };
        }
        setAttendances(map);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [selectedClass, selectedDate]);

  // Fetch tab progress whenever date changes
  useEffect(() => { fetchProgress(selectedDate); }, [selectedDate, fetchProgress]);

  const getProgress = (classId: string) => progress.find(p => p.classId === classId);

  const handleMark = async (studentId: string, status: Status) => {
    setSaving(studentId);
    const prev = { ...attendances };
    setAttendances(a => ({ ...a, [studentId]: { student_id: studentId, status, note: '' } }));
    try {
      await markAttendance(studentId, selectedClass, selectedDate, status, '');
      // Refresh tab progress for current class
      fetchProgress(selectedDate);
    } catch {
      setAttendances(prev);
      showToast('Không thể lưu điểm danh. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!students.length) return;
    setLoading(true);
    try {
      await Promise.all(
        students
          .filter(s => attendances[s.id]?.status !== 'present')
          .map(s => markAttendance(s.id, selectedClass, selectedDate, 'present', ''))
      );
      const map = { ...attendances };
      students.forEach(s => { map[s.id] = { student_id: s.id, status: 'present', note: '' }; });
      setAttendances(map);
      fetchProgress(selectedDate);
      showToast(`Đã điểm danh CÓ MẶT toàn lớp (${students.length} học viên)!`);
    } catch { showToast('Lỗi khi điểm danh hàng loạt.', 'error'); }
    finally { setLoading(false); }
  };



  const AVATAR_COLORS = ['from-pink-500 to-purple-600','from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-cyan-500 to-blue-600'];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Date picker + quick action ─────────────────────────────── */}
      <div className="glass-card flex flex-col sm:flex-row gap-3 p-4 items-end">
        <div className="flex-1 relative">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Ngày điểm danh</label>
          <div className="relative">
            <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-pink-500/50 [color-scheme:dark]"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => { setSelectedDate(e.target.value); }}
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleMarkAllPresent}
            disabled={loading || !students.length}
            className="flex-1 sm:flex-none text-xs font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Check size={14} /> Cả lớp có mặt
          </button>

        </div>
      </div>

      {/* ── Class tabs ─────────────────────────────────────────────── */}
      {classes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Filter size={14} /> Danh sách lớp (Lọc theo lịch học)
             </div>
             <label className="flex items-center gap-2 cursor-pointer group">
                <span className={`text-xs font-bold ${showAllClasses ? 'text-pink-400' : 'text-slate-500'} group-hover:text-pink-400 transition-colors`}>Hiện tất cả các lớp</span>
                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${showAllClasses ? 'bg-pink-500' : 'bg-slate-700'}`}>
                  <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showAllClasses ? 'translate-x-2' : '-translate-x-2'}`} />
                  <input type="checkbox" checked={showAllClasses} onChange={() => setShowAllClasses(!showAllClasses)} className="sr-only" />
                </div>
             </label>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(() => {
              const parts = selectedDate.split('-');
              const targetDay = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getDay();
              const scheduledClasses = classes.filter(cls => 
                cls.schedules?.some(s => s.day_of_week === targetDay)
              );
              
              const displayedClasses = showAllClasses ? classes : scheduledClasses;

              // Auto-select first class if current selection is swept away
              if (displayedClasses.length > 0 && !displayedClasses.find(c => c.id === selectedClass)) {
                 // Do this in a microtask to avoid react update during render
                 queueMicrotask(() => setSelectedClass(displayedClasses[0].id));
              }

              if (displayedClasses.length === 0) {
                 return (
                   <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center w-full text-slate-400 text-sm font-medium">
                     Không có lớp nào có lịch tập vào ngày này. Hãy bật "Hiện tất cả" ở góc trên để thấy toàn bộ danh sách lớp.
                   </div>
                 );
              }

              return displayedClasses.map(cls => {
                const prog = getProgress(cls.id);
                const isActive = selectedClass === cls.id;
                const isDone = prog && prog.total > 0 && prog.marked === prog.total;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                      isActive
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-inner'
                        : isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400 hover:text-white hover:bg-white/5'
                        : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{cls.name}</span>
                    {prog && <TabBadge marked={prog.marked} total={prog.total} />}
                  </button>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ── Student list ───────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">

        {/* Summary bar */}
        <SummaryBar attendances={attendances} total={students.length} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-pink-500 mb-3" />
            <p className="text-slate-500 text-sm font-medium">Đang tải danh sách...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {students.map((student, idx) => {
              const status = attendances[student.id]?.status;
              const isSaving = saving === student.id;
              const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    status === 'present' ? 'bg-emerald-500/[0.04]' :
                    status === 'absent'  ? 'bg-red-500/[0.04]' :
                    status === 'late'    ? 'bg-amber-500/[0.04]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <p className="flex-1 text-sm font-semibold text-slate-200 truncate">
                    {student.full_name}
                    {isSaving && <Loader2 size={11} className="inline ml-2 animate-spin text-pink-400" />}
                  </p>

                  {/* Status buttons — compact */}
                  <div className="flex gap-1.5 shrink-0">
                    {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      const isActive = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleMark(student.id, s)}
                          title={cfg.label}
                          disabled={isSaving}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 ${
                            isActive ? `${cfg.color} shadow-md` : cfg.inactive
                          }`}
                        >
                          <Icon size={15} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
              <CalendarIcon size={22} className="text-slate-600" />
            </div>
            <p className="text-white font-bold text-sm">Lớp chưa có học viên</p>
            <p className="text-slate-500 text-xs mt-1">Vui lòng thêm học viên vào lớp trước khi điểm danh.</p>
          </div>
        )}
      </div>



      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4">
          <div className={`px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl font-bold backdrop-blur-md border text-sm ${
            toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
            toast.type === 'error'   ? 'bg-red-500/20 border-red-500/40 text-red-300' :
            'bg-amber-500/20 border-amber-500/40 text-amber-300'
          }`}>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
