'use client';

import { useState } from 'react';
import { LogOut, Send, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { createShiftLog } from '@/app/actions/shift-log';

export default function ShiftHandoverModal({ unresolvedAlertsCount }: { unresolvedAlertsCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    try {
      await createShiftLog(note, { count: unresolvedAlertsCount, timestamp: new Date().toISOString() });
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setNote('');
        window.location.reload(); // Reload to show the new log
      }, 1500);
    } catch (error) {
      console.error('Error saving shift log', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
      >
        <LogOut size={16} />
        Chốt sổ cuối ngày
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileText className="text-indigo-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Chốt Sổ Cuối Ngày</h3>
                <p className="text-xs text-slate-400">Chốt trạng thái dòng tiền và gửi lời nhắc cho ngày mai</p>
              </div>
            </div>

            {unresolvedAlertsCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
                <p className="text-red-400 text-xs">
                  Hiện đang có <strong className="font-black text-red-300">{unresolvedAlertsCount} cảnh báo đỏ</strong> chưa được xử lý. Hệ thống sẽ tự động đính kèm số liệu này vào biên bản chốt sổ.
                </p>
              </div>
            )}

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4 animate-in zoom-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <p className="text-emerald-400 font-bold">Đã lưu chốt sổ!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ghi chú cuối ngày</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Anh Hưng ơi bé Bo hôm nay mệt nên về sớm..."
                    className="w-full h-32 bg-slate-950/50 border border-white/5 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
                    required
                  />
                </div>
                
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !note.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Xác nhận
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
