'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardDatePickerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    // If no date in URL, assume today locally
    if (dateParam) {
      setSelectedDate(dateParam);
    } else {
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
      setSelectedDate(today);
    }
  }, [dateParam]);

  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    router.push(`/dashboard?date=${newDateStr}`);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate || new Date());
    d.setDate(d.getDate() + days);
    const newDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
    handleDateChange(newDateStr);
  };

  const getTodayStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const isToday = selectedDate === getTodayStr();

  const getRelativeDayName = (dateStr: string) => {
    const todayStr = getTodayStr();
    if (dateStr === todayStr) return 'Hôm nay';
    
    const d = new Date(dateStr);
    const todayDate = new Date(todayStr);
    const diffTime = d.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays === 1) return 'Ngày mai';
    
    // Format to DD/MM
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(d);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
      <button 
        onClick={() => shiftDate(-1)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Ngày hôm trước"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="relative flex items-center justify-center min-w-[120px]">
        <button
          className={`px-4 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isToday ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-white'}`}
          onClick={() => (document.getElementById('dashboard-date-picker') as HTMLInputElement)?.showPicker()}
        >
          <CalendarIcon size={14} className={isToday ? 'text-pink-500' : 'text-slate-400'} />
          <span>{selectedDate ? getRelativeDayName(selectedDate) : 'Hôm nay'}</span>
        </button>
        <input 
          id="dashboard-date-picker"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
      </div>

      <button 
        onClick={() => shiftDate(1)}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Ngày hôm sau"
      >
        <ChevronRight size={18} />
      </button>
      
      {!isToday && (
        <button 
          onClick={() => handleDateChange(getTodayStr())}
          className="px-3 py-1.5 text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all ml-1"
        >
          Trở về
        </button>
      )}
    </div>
  );
}
