'use client';

import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Save, Loader2, Calendar } from 'lucide-react';
import { addSchedule } from '@/app/actions/class';

interface AddScheduleModalProps {
  classId: string;
  coaches: any[];
  defaultCoachIds?: string[]; // [MỚI] Danh sách HLV mặc định của lớp
  onClose: () => void;
}

export function AddScheduleModal({ classId, coaches, defaultCoachIds = [], onClose }: AddScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const days = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await addSchedule(formData);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thêm lịch học');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Calendar size={16} />
            </div>
            Thêm ca học mới
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          <input type="hidden" name="class_id" value={classId} />
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

          {/* Tips */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-start gap-2.5">
            <Calendar size={13} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Chọn nhiều thứ để tạo hàng loạt lịch học cho cả tuần cùng lúc.
            </p>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2.5 block">Thứ trong tuần *</label>
            <div className="flex flex-wrap sm:grid sm:grid-cols-7 gap-2">
              {days.map(d => (
                <label key={d.value} className="relative group cursor-pointer flex-1 min-w-[44px] sm:min-w-0">
                  <input 
                    type="checkbox" 
                    name="day_of_week" 
                    value={d.value} 
                    className="peer sr-only"
                  />
                  <div className="bg-white/5 border border-white/10 rounded-xl py-3 text-center text-[10px] sm:text-xs font-black text-slate-400 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-500/50 transition-all hover:bg-white/10 active:scale-90 shadow-lg">
                    {d.label.replace('Thứ ', 'T')}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-4">
            <div className="flex-1 group">
              <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5 group-focus-within:text-purple-400 transition-colors">
                <Clock size={11} /> GIỜ BẮT ĐẦU
              </label>
              <input type="time" name="start_time" defaultValue="17:00" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-base font-black shadow-2xl" />
            </div>
            <div className="flex-1 group">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 flex items-center gap-1.5 group-focus-within:text-purple-400 transition-colors">
                <Clock size={11} /> GIỜ KẾT THÚC
              </label>
              <input type="time" name="end_time" defaultValue="18:30" required className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-base font-black shadow-2xl" />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 block">Huấn luyện viên phụ trách *</label>
            <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {coaches.map(coach => (
                <label key={coach.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="relative flex items-center shrink-0">
                    <input 
                      type="checkbox" 
                      name="coach_ids" 
                      value={coach.id} 
                      defaultChecked={defaultCoachIds.includes(coach.id)}
                      className="peer appearance-none w-4 h-4 border border-white/20 rounded checked:bg-purple-500 checked:border-purple-500 transition-all"
                    />
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors truncate">{coach.display_name}</span>
                </label>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 mt-1 italic">* Đã chọn sẵn HLV mặc định của lớp.</p>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Địa điểm & GPS</label>
            <div className="space-y-2">
              <input 
                name="location" 
                type="text" 
                placeholder="Ví dụ: Sân Tennis Vũ Trụ" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium" 
              />
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    id="coords-input-add"
                    name="coords" 
                    type="text" 
                    placeholder="Tọa độ (Lat, Lng)" 
                    className="w-full bg-slate-950 border border-white/5 text-[10px] text-slate-400 rounded-lg py-2 pl-8 pr-3 focus:outline-none" 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const input = document.getElementById('coords-input-add') as HTMLInputElement;
                        if (input) input.value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                      });
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-lg text-xs font-bold transition-colors"
                >
                  Ghim
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-1 italic">* Để trống nếu muốn dùng tọa độ mặc định của trung tâm</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Lưu lịch học</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
