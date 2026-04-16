'use client';

import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Save, Loader2, Calendar, Trash2 } from 'lucide-react';
import { updateSingleSchedule, deleteSchedule } from '@/app/actions/class';

interface EditScheduleModalProps {
  classId: string;
  schedule: any;
  coaches: any[];
  onClose: () => void;
}

export function EditScheduleModal({ classId, schedule, coaches, onClose }: EditScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      await updateSingleSchedule(schedule.id, classId, formData);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi cập nhật lịch học');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch tập này?')) return;
    setDeleteLoading(true);
    setError('');
    
    try {
      await deleteSchedule(schedule.id, classId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa lịch học');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
              <Calendar size={16} />
            </div>
            Sửa ca học
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

          {/* Tips */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-3">
            <Calendar size={14} className="text-indigo-400 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <b>Mẹo:</b> Chọn nhiều thứ để tự động sao chép ca học này sang các ngày khác.
            </p>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-3 block">Thứ trong tuần *</label>
            <div className="grid grid-cols-4 gap-2">
              {days.map(d => (
                <label key={d.value} className="relative group cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="day_of_week" 
                    value={d.value} 
                    defaultChecked={schedule.day_of_week === d.value}
                    className="peer sr-only"
                  />
                  <div className="bg-white/5 border border-white/10 rounded-xl py-2 text-center text-[10px] font-bold text-slate-400 peer-checked:bg-pink-500 peer-checked:text-white peer-checked:border-pink-500/50 transition-all hover:bg-white/10 group-active:scale-95">
                    {d.label.replace('Thứ ', 'T')}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
            <div className="min-w-0">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1">
                <Clock size={10} /> Bắt đầu *
              </label>
              <input type="time" name="start_time" defaultValue={schedule.start_time.slice(0, 5)} required className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-medium" />
            </div>
            <div className="min-w-0">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1">
                <Clock size={10} /> Kết thúc *
              </label>
              <input type="time" name="end_time" defaultValue={schedule.end_time.slice(0, 5)} required className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-medium" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Huấn luyện viên phụ trách</label>
            <select 
              name="coach_id" 
              defaultValue={schedule.coach_id || ""}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium"
            >
              <option value="" className="bg-slate-900 text-slate-400">Dùng HLV chính của lớp (Mặc định)</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id} className="bg-slate-900 text-white">
                  Thầy {coach.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Địa điểm & GPS</label>
            <div className="space-y-2">
              <input 
                name="location" 
                type="text" 
                defaultValue={schedule.location || ''} 
                placeholder="Ví dụ: Sân Tennis Vũ Trụ" 
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-medium" 
              />
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    id="coords-input"
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
                        const input = document.getElementById('coords-input') as HTMLInputElement;
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
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={deleteLoading || loading}
              className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Xóa
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                Hủy
              </button>
              <button type="submit" disabled={loading || deleteLoading} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-pink-600/25 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Lưu</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
