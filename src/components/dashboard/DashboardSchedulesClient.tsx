'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ExternalLink, Filter } from 'lucide-react';
import RemindCoachButton from '@/components/dashboard/RemindCoachButton';

type Schedule = { id: string; start_time?: string; end_time?: string; classes?: { name?: string }; location?: string };

export default function DashboardSchedulesClient({ 
  schedules, 
  schedulesWithCheckin, 
  schedulesWithAttendance,
  scheduleStats
}: { 
  schedules: Schedule[];
  schedulesWithCheckin: string[];
  schedulesWithAttendance: string[];
  scheduleStats?: Record<string, { total: number, marked: number }>;
}) {
  const [filter, setFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  
  // Convert Sets for quick lookup
  const checkinSet = new Set(schedulesWithCheckin);
  const attendanceSet = new Set(schedulesWithAttendance);

  const filteredSchedules = schedules.filter(s => {
    if (filter === 'all') return true;
    const hour = parseInt(s.start_time?.substring(0, 2) || '0', 10);
    if (filter === 'morning') return hour < 12;
    if (filter === 'afternoon') return hour >= 12 && hour < 18;
    if (filter === 'evening') return hour >= 18;
    return true;
  });

  return (
    <div className="glass-card p-8 bg-slate-900/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Calendar size={22} className="text-pink-500" />
          <span>Lịch học hôm nay</span>
        </h3>
        
        <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
          <Filter size={14} className="text-slate-500 ml-2 shrink-0" />
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Tất cả ({schedules.length})
          </button>
          <button 
            onClick={() => setFilter('morning')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${filter === 'morning' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Sáng
          </button>
          <button 
            onClick={() => setFilter('afternoon')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${filter === 'afternoon' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Chiều
          </button>
          <button 
            onClick={() => setFilter('evening')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${filter === 'evening' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Tối
          </button>
        </div>
      </div>

      {filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="flex flex-col p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] hover:border-pink-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-slate-950 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0 shadow-inner">
                  <span className="text-[10px] text-slate-500 uppercase font-black">Bắt đầu</span>
                  <span className="text-xl font-bold text-pink-100">{schedule.start_time?.substring(0, 5) || '--:--'}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg group-hover:text-pink-400 transition-colors line-clamp-1">{schedule.classes?.name || 'Lớp học'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded-md">
                      <MapPin size={10} className="text-pink-500" /> {schedule.location || 'Sân tập'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">đến {schedule.end_time?.substring(0, 5) || '--:--'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between gap-3 mt-auto pt-4 border-t border-white/5">
                <div className="flex-1 flex flex-col gap-2">
                   {!checkinSet.has(schedule.id) ? (
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded w-fit">Chưa Check-in</span>
                   ) : (
                     <>
                       {scheduleStats && scheduleStats[schedule.id] && scheduleStats[schedule.id].total > 0 && (
                         <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 rounded-full transition-all" 
                               style={{ width: `${Math.min(100, (scheduleStats[schedule.id].marked / scheduleStats[schedule.id].total) * 100)}%` }}
                             />
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                             {scheduleStats[schedule.id].marked}/{scheduleStats[schedule.id].total} bé
                           </span>
                         </div>
                       )}
                       {(!scheduleStats || !scheduleStats[schedule.id] || scheduleStats[schedule.id].marked < scheduleStats[schedule.id].total) && (
                         <div className="w-fit">
                           <RemindCoachButton scheduleId={schedule.id} />
                         </div>
                       )}
                     </>
                   )}
                </div>
                <Link href={`/attendance?sessionId=${schedule.id}`} className="bg-pink-600/10 text-pink-500 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 hover:text-white transition-all whitespace-nowrap shadow-lg">
                  Điểm danh
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-950/30 rounded-3xl border border-white/5 border-dashed">
           <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
              <Calendar className="text-slate-700" size={32} />
           </div>
           <p className="text-slate-500 text-sm font-medium">Không có lịch học nào phù hợp với bộ lọc.</p>
        </div>
      )}
      
      <div className="mt-6 text-center">
         <Link href="/attendance" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
           Xem toàn bộ lịch học <ExternalLink size={14}/>
         </Link>
      </div>
    </div>
  );
}
