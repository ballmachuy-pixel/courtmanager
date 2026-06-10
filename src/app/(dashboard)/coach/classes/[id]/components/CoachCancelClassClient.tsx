'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { coachCancelClassSession } from '@/app/actions/coach';
import { toast } from 'sonner';

export function CoachCancelClassClient({ scheduleId }: { scheduleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy ca');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await coachCancelClassSession(scheduleId, reason);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      toast.success('Đã hủy ca học thành công');
      setIsOpen(false);
    } catch (err) {
      setError('Đã có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 active:scale-95 transition-all flex items-center gap-1"
      >
        <AlertTriangle size={14} />
        Hủy Ca
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Hủy Ca Học
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-400 font-medium">
                Vui lòng nhập lý do hủy ca học hôm nay. Học sinh và phụ huynh sẽ được thông báo tự động nếu áp dụng.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  Lý do hủy (Ví dụ: Trời mưa)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-white/5 rounded-xl border border-white/10 active:scale-95 transition-transform disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-xl active:scale-95 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Xác Nhận Hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
