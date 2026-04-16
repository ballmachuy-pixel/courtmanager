'use client';

import { useState, useTransition } from 'react';
import { X, ShieldCheck, Loader2, UserCheck, AlertCircle } from 'lucide-react';
import { adminManualCheckin } from '@/app/actions/coach';

interface AdminManualCheckinModalProps {
  schedule: any;
  coaches: any[];
  onClose: () => void;
}

export default function AdminManualCheckinModal({ schedule, coaches, onClose }: AdminManualCheckinModalProps) {
  const [selectedCoachId, setSelectedCoachId] = useState(schedule.coach_id || schedule.classes?.coach_id || '');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleManualCheckin = () => {
    if (!selectedCoachId) {
      alert('Vui lòng chọn huấn luyện viên cần chấm công.');
      return;
    }

    startTransition(async () => {
      try {
        await adminManualCheckin({
          scheduleId: schedule.id,
          coachId: selectedCoachId,
          notes: notes || `Admin xác nhận thủ công - ${new Date().toLocaleTimeString('vi-VN')}`
        });
        onClose();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Lỗi khi chấm công hộ');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={16} />
            </div>
            Chấm công thủ công
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-200/70 leading-relaxed font-medium">
              Sử dụng tính năng này để xác nhận ca dạy cho HLV khi họ gặp sự cố kỹ thuật không thể tự chấm công.
            </p>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Chọn Huấn luyện viên *</label>
            <div className="relative">
              <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select 
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-medium appearance-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Chọn thầy --</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id} className="bg-slate-900 text-white">
                    Thầy {coach.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Ghi chú (Tùy chọn)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Thầy quên điện thoại, Hưng xác nhận..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-medium h-20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
            >
              Hủy
            </button>
            <button 
              onClick={handleManualCheckin}
              disabled={isPending}
              className="flex-[1.5] bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={16} /> Xác nhận ngay</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
