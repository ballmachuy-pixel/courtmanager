'use client';

import { useState, useTransition } from 'react';
import { PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { freezeStudentAction } from '@/app/actions/student';
import { toast } from 'sonner';

export default function FreezeStudentButton({ 
  studentId, 
  currentStatus 
}: { 
  studentId: string; 
  currentStatus: string 
}) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  
  const isFrozen = currentStatus === 'frozen';

  const handleToggleFreeze = () => {
    if (!reason.trim() && !isFrozen) {
      toast.error('Vui lòng nhập lý do bảo lưu');
      return;
    }

    startTransition(async () => {
      try {
        const res = await freezeStudentAction({
          studentId,
          reason: isFrozen ? 'Đăng ký học lại' : reason
        });
        
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(isFrozen ? 'Đã mở bảo lưu, học viên có thể đi học lại!' : 'Đã bảo lưu học viên thành công!');
          setShowModal(false);
        }
      } catch (err) {
        toast.error('Đã xảy ra lỗi hệ thống');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => isFrozen ? handleToggleFreeze() : setShowModal(true)}
        disabled={isPending}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
          isFrozen 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
        }`}
      >
        {isPending ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isFrozen ? (
          <PlayCircle size={18} />
        ) : (
          <PauseCircle size={18} />
        )}
        <span className="hidden sm:inline">
          {isFrozen ? 'Mở bảo lưu' : 'Bảo lưu'}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Xác nhận bảo lưu</h3>
            </div>
            <p className="text-sm text-white/60 mb-6">
              Học viên sẽ tạm ngưng học và không bị trừ buổi/ngày trong thời gian bảo lưu. Bạn có chắc chắn muốn thực hiện?
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Lý do bảo lưu *</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Nghỉ hè, Chấn thương..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-500/50 h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleToggleFreeze}
                disabled={isPending}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors flex justify-center items-center gap-2"
              >
                {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
