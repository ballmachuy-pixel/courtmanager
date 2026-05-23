'use client';

import { useState } from 'react';
import { scheduleTrial } from '@/app/actions/crm';
import { Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';

export default function ScheduleTrialForm({ leadId, schedules }: { leadId: string, schedules: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await scheduleTrial(
        leadId,
        formData.get('scheduleId') as string,
        formData.get('trialDate') as string
      );
      setIsOpen(false);
    } catch (err) {
      alert('Lỗi xếp lịch học thử');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 flex items-center gap-1"
      >
        <CalendarIcon size={12} /> Xếp lịch học
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-bold mb-6">Xếp lịch học thử</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Chọn ngày học</label>
                <input required type="date" name="trialDate" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Chọn ca học</label>
                <select required name="scheduleId" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Chọn ca --</option>
                  {schedules.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.classes?.name} ({s.day_of_week}) - {s.start_time}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                disabled={isSubmitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Xác nhận
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
