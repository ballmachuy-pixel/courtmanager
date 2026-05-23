'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarIcon, Loader2, Check, X, Clock, FileText,
  CheckCircle2, AlertCircle, Circle, Filter, Search
} from 'lucide-react';
import { getAttendanceData, markAttendance, getScheduleAttendanceSummary } from '@/app/actions/attendance';

type Status = 'present' | 'absent' | 'late' | 'excused';

interface ScheduleItem { id: string; day_of_week: number; start_time: string; end_time: string; }
interface ClassItem { id: string; name: string; schedules?: ScheduleItem[]; }
interface Student  { id: string; full_name: string; avatar_url: string | null; session_balance?: number; }
interface AttendanceRecord { student_id: string; status: Status; note: string | null; }
interface SessionProgress { scheduleId: string; total: number; marked: number; }
interface TrialRecord { id: string; trial_date: string; status: string; coach_evaluation: string | null; leads: { id: string; student_name: string; parent_phone: string; } }

interface SessionItem {
  id: string;
  classId: string;
  className: string;
  startTime: string;
  endTime: string;
}

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
  const isDone = marked === total;
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md ${
      isDone ? 'text-emerald-400 bg-emerald-500/10' : 
      marked > 0 ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 bg-white/5'
    }`}>
      {isDone ? <CheckCircle2 size={9} /> : marked > 0 ? <AlertCircle size={9} /> : <Circle size={9} />}
      {marked}/{total}
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
        {marked}/{total} học viên
      </span>
      {Object.entries(counts).map(([status, count]) => {
        if (count === 0) return null;
        const config = STATUS_CONFIG[status as Status];
        const Icon = config.icon;
        return (
          <span key={status} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${config.color.replace('bg-', 'bg-').replace('text-white', 'text-white/80')}`}>
            <Icon size={9} /> {count} {config.label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function AttendanceManager({ classes }: { classes: ClassItem[] }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [attendances, setAttendances] = useState<Record<string, AttendanceRecord>>({});
  const [progress, setProgress] = useState<SessionProgress[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() - 7);
  const minDateString = minDateObj.toISOString().split('T')[0];
  const isBackfill = selectedDate < todayDate;

  // Logic Smart-Focus: Tìm buổi học gần thời gian hiện tại nhất
  const getSmartFocusId = (sessionList: SessionItem[]) => {
    if (!sessionList.length) return '';
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let closestId = sessionList[0].id;
    let minDiff = Infinity;

    for (const s of sessionList) {
      const [h, m] = s.startTime.split(':').map(Number);
      const sessionMinutes = h * 60 + m;
      
      const [eh, em] = s.endTime.split(':').map(Number);
      const endMinutes = eh * 60 + em;

      // Ưu tiên ca đang diễn ra
      if (currentMinutes >= sessionMinutes && currentMinutes <= endMinutes) {
        return s.id;
      }

      const diff = Math.abs(currentMinutes - sessionMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestId = s.id;
      }
    }
    return closestId;
  };

  // 1. Tính toán danh sách Sessions dựa trên ngày
  useEffect(() => {
    const parts = selectedDate.split('-');
    const targetDay = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getDay();
    
    const allSessions: SessionItem[] = [];
    classes.forEach(c => {
      c.schedules?.forEach(s => {
        if (showAllClasses || s.day_of_week === targetDay) {
          allSessions.push({
            id: s.id,
            classId: c.id,
            className: c.name,
            startTime: s.start_time,
            endTime: s.end_time || ''
          });
        }
      });
    });

    allSessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSessions(allSessions);

    // Tự động chọn ca học (Smart Focus)
    if (allSessions.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        setSelectedScheduleId(getSmartFocusId(allSessions));
      } else {
        setSelectedScheduleId(allSessions[0].id);
      }
    } else {
      setSelectedScheduleId('');
    }
  }, [selectedDate, classes, showAllClasses]);

  // 2. Fetch Progress (tóm tắt đã điểm danh)
  const fetchProgress = useCallback(async () => {
    if (!sessions.length) return;
    try {
      const data = await getScheduleAttendanceSummary(sessions.map(s => s.id), selectedDate);
      setProgress(data);
    } catch (e) {
      console.error('Progress error:', e);
    }
  }, [sessions, selectedDate]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  // 3. Fetch Students và Attendance của Session được chọn
  useEffect(() => {
    if (!selectedScheduleId || !selectedDate) {
      setStudents([]);
      setAttendances({});
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getAttendanceData(selectedScheduleId, selectedDate);
        setStudents(data.students);
        setTrials(data.trials || []);
        const map: Record<string, AttendanceRecord> = {};
        for (const att of data.attendances) {
          map[att.student_id] = { student_id: att.student_id, status: att.status, note: att.note };
        }
        setAttendances(map);
      } catch (e) { 
        console.error(e);
      } finally { setLoading(false); }
    };
    fetch();
  }, [selectedScheduleId, selectedDate]);

  const handleMark = async (studentId: string, status: Status) => {
    if ('vibrate' in navigator) navigator.vibrate(50);
    const session = sessions.find(s => s.id === selectedScheduleId);
    if (!session) return;

    setSaving(studentId);
    const prev = { ...attendances };
    setAttendances(a => ({ ...a, [studentId]: { student_id: studentId, status, note: '' } }));
    
    try {
      await markAttendance(studentId, session.classId, selectedScheduleId, selectedDate, status, '');
      fetchProgress();
    } catch {
      setAttendances(prev);
      showToast('Lỗi lưu điểm danh', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!students.length || !selectedScheduleId) return;
    const session = sessions.find(s => s.id === selectedScheduleId);
    if (!session) return;

    setLoading(true);
    try {
      const unMarked = students.filter(s => attendances[s.id]?.status !== 'present');
      await Promise.all(
        unMarked.map(s => markAttendance(s.id, session.classId, selectedScheduleId, selectedDate, 'present', ''))
      );
      
      const newMap = { ...attendances };
      students.forEach(s => { newMap[s.id] = { student_id: s.id, status: 'present', note: '' }; });
      setAttendances(newMap);
      fetchProgress();
      showToast(`Đã điểm danh ${unMarked.length} học viên CÓ MẶT`);
    } catch { 
      showToast('Lỗi điểm nhanh', 'error'); 
    } finally { setLoading(false); }
  };

  const AVATAR_COLORS = ['from-pink-500 to-purple-600','from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-cyan-500 to-blue-600'];

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Action Bar */}
      <div className="glass-card flex flex-col sm:flex-row gap-4 p-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ngày huấn luyện</label>
          <div className="relative">
            <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="date"
              className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-pink-500/50 [color-scheme:dark] transition-all"
              value={selectedDate}
              min={minDateString}
              max={todayDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleMarkAllPresent}
          disabled={loading || !students.length}
          className="bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600/20 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/5 uppercase tracking-wide"
        >
          <Check size={16} strokeWidth={3} /> Điểm danh nhanh
        </button>
      </div>

      {isBackfill && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm flex items-start gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-black tracking-wide uppercase mb-1">Chế độ điểm danh bù</p>
            <p className="font-medium text-amber-500/80">Bạn đang chọn một ngày trong quá khứ. Dữ liệu sẽ tự động được ghi chú là điểm danh bù.</p>
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
               <Clock size={12} strokeWidth={3} /> Ca học trong ngày
           </div>
           <label className="flex items-center gap-2 cursor-pointer group select-none">
              <span className={`text-[9px] font-black uppercase tracking-widest ${showAllClasses ? 'text-pink-400' : 'text-slate-600'} transition-colors`}>Hiện tất cả</span>
              <div className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${showAllClasses ? 'bg-pink-500' : 'bg-slate-800 border border-white/5'}`}>
                <span className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white transition duration-200 ${showAllClasses ? 'translate-x-1.5' : '-translate-x-1.5'}`} />
                <input type="checkbox" checked={showAllClasses} onChange={() => setShowAllClasses(!showAllClasses)} className="sr-only" />
              </div>
           </label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {sessions.length > 0 ? (
            sessions.map(s => {
              const prog = progress.find(p => p.scheduleId === s.id);
              const isActive = selectedScheduleId === s.id;
              const isDone = prog && prog.total > 0 && prog.marked === prog.total;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedScheduleId(s.id)}
                  className={`flex flex-col gap-2 p-3.5 rounded-2xl text-left transition-all border group relative overflow-hidden ${
                    isActive ? 'bg-indigo-500/15 border-indigo-500/40 ring-1 ring-indigo-500/40' :
                    isDone ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' :
                    'bg-white/[0.03] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-xs font-black truncate flex-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {s.className}
                    </span>
                    {prog && <TabBadge marked={prog.marked} total={prog.total} />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                    <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                      {s.startTime.slice(0, 5)} {s.endTime ? `- ${s.endTime.slice(0, 5)}` : ''}
                    </span>
                  </div>
                  {isActive && <div className="absolute top-0 right-0 p-1 bg-indigo-500 text-white rounded-bl-lg"><Check size={8} strokeWidth={4} /></div>}
                </button>
              );
            })
          ) : (
            <div className="col-span-full bg-slate-900/50 border border-white/5 border-dashed rounded-2xl py-8 text-center">
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Không có ca huấn luyện</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance List */}
      <div className="glass-card overflow-hidden shadow-2xl relative">
        <SummaryBar attendances={attendances} total={students.length} />

        {students.length > 0 && !loading && (
          <div className="p-4 border-b border-white/[0.03] bg-white/[0.01] relative z-20">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Gõ tên để tìm nhanh... (VD: Quang Vinh)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all shadow-inner"
              />
              
              {/* Dropdown Gợi ý (Combobox) */}
              {showSuggestions && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 max-h-64 overflow-y-auto z-50">
                  {students.filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                    <ul className="divide-y divide-white/5">
                      {students.filter(s => s.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                        <li 
                          key={`suggest-${s.id}`}
                          className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center justify-between group transition-colors"
                          onClick={() => {
                            setSearchQuery('');
                            setShowSuggestions(false);
                            const el = document.getElementById(`student-row-${s.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              el.classList.add('bg-pink-500/20');
                              setTimeout(() => el.classList.remove('bg-pink-500/20'), 2000);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-slate-300">
                              {s.full_name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white">{s.full_name}</span>
                          </div>
                          <span className="text-[10px] font-black text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-pink-500/10 px-2 py-1 rounded">
                            Cuộn đến &darr;
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Không tìm thấy học viên "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-pink-500 mb-4" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Đang nạp dữ liệu</p>
          </div>
        ) : students.length > 0 ? (
          <div className="divide-y divide-white/[0.03]">
            {/* ─── HIỂN THỊ HỌC VIÊN HỌC THỬ (TRIALS) ─── */}
            {trials.length > 0 && (
              <div className="bg-indigo-500/[0.02] border-b border-white/[0.03]">
                <div className="px-5 py-3 border-b border-indigo-500/10 bg-indigo-500/5">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-base">🔥</span> Học viên học thử
                  </h4>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {trials.map((trial, idx) => (
                    <div key={trial.id} className="flex flex-col md:flex-row md:items-center gap-4 px-5 py-5 transition-all duration-500 group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg">
                          {trial.leads.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-white truncate flex items-center gap-2">
                            {trial.leads.student_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              HỌC THỬ
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">PH: {trial.leads.parent_phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Đánh giá */}
                      <div className="flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
                        {trial.status === 'attended' && trial.coach_evaluation ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                            Đã đánh giá: {trial.coach_evaluation === 'good' ? 'Tốt' : trial.coach_evaluation === 'average' ? 'Khá' : 'Cần cố gắng'}
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {['good', 'average', 'needs_practice'].map(val => (
                              <button
                                key={val}
                                onClick={async () => {
                                  const { submitCoachEvaluation } = await import('@/app/actions/crm');
                                  await submitCoachEvaluation(trial.id, trial.leads.id, val);
                                  // Refresh data locally
                                  setTrials(trials.map(t => t.id === trial.id ? { ...t, status: 'attended', coach_evaluation: val } : t));
                                  showToast('Đã lưu đánh giá học thử');
                                }}
                                className="px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700"
                              >
                                {val === 'good' ? 'Tốt' : val === 'average' ? 'Khá' : 'Yếu'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── HIỂN THỊ HỌC VIÊN CHÍNH THỨC ─── */}
            {students.map((student, idx) => {
              const status = attendances[student.id]?.status;
              const isSaving = saving === student.id;
              const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <div id={`student-row-${student.id}`} key={student.id} className={`flex flex-col md:flex-row md:items-center gap-4 px-5 py-5 transition-all duration-500 group border-b border-white/[0.03] last:border-0 ${
                  status === 'present' ? 'bg-emerald-500/[0.03]' :
                  status === 'absent' ? 'bg-red-500/[0.03]' :
                  status === 'late' ? 'bg-amber-500/[0.03]' : ''
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    {/* ID / Initial */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Name & Loading */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-slate-100 truncate flex items-center gap-2">
                        {student.full_name}
                        {isSaving && <Loader2 size={12} className="animate-spin text-pink-500" />}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          (student.session_balance || 0) <= 0 ? 'bg-red-500/10 text-red-500 animate-pulse' :
                          (student.session_balance || 0) === 1 ? 'bg-amber-500/10 text-amber-500' :
                          'bg-white/5 text-slate-400'
                        }`}>
                          Còn {student.session_balance || 0} buổi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Marking Buttons - Large for Mobile */}
                  <div className="flex justify-between md:justify-end gap-2 md:gap-2 mt-2 md:mt-0">
                    {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      const isActive = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleMark(student.id, s)}
                          disabled={isSaving}
                          className={`flex-1 md:w-12 md:h-12 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 border ${
                            isActive 
                              ? `${cfg.color} border-transparent ring-4 ring-white/10` 
                              : `${cfg.inactive} border-white/5`
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 3 : 2} />
                            <span className="text-[8px] font-black uppercase md:hidden">{cfg.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center px-6">
             <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center text-slate-800 mb-6 border border-white/5 border-dashed">
                <Filter size={32} />
             </div>
             <h3 className="text-white font-black text-sm uppercase tracking-widest mb-2">Chưa chọn buổi học</h3>
             <p className="text-slate-500 text-xs font-medium max-w-[240px] leading-relaxed">Vui lòng chọn một ca huấn luyện ở danh sách phía trên để bắt đầu điểm danh cho học viên.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-6 left-6 sm:left-auto sm:w-[320px] z-50 animate-in slide-in-from-bottom-6">
           <div className={`px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-4 font-black text-[10px] uppercase tracking-wider ${
             toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
           }`}>
             <span className="flex-1 leading-tight">{toast.message}</span>
             <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={14} /></button>
           </div>
        </div>
      )}
    </div>
  );
}
