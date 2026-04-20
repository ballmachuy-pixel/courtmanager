'use client';

import { useState } from 'react';
import { BellRing, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { remindCoachAction } from '@/app/actions/class';
import { toast } from 'sonner';

interface RemindCoachButtonProps {
  scheduleId: string;
}

export default function RemindCoachButton({ scheduleId }: RemindCoachButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRemind = async () => {
    if (loading || sent) return;
    
    setLoading(true);
    try {
      const result = await remindCoachAction(scheduleId);
      
      if (result.success) {
        setSent(true);
        toast.success('Đã gửi thông báo nhắc nhở HLV qua Zalo');
      } else {
        toast.error(result.error || 'Không thể gửi thông báo. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Remind coach error:', error);
      toast.error('Lỗi hệ thống khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemind}
      disabled={loading || sent}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
        ${sent 
          ? 'bg-emerald-500/10 text-emerald-500 cursor-default' 
          : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white active:scale-95'
        }
        ${loading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : sent ? (
        <CheckCircle size={14} />
      ) : (
        <BellRing size={14} className="animate-bounce" />
      )}
      
      {sent ? 'Đã nhắc' : 'Nhắc HLV'}
    </button>
  );
}
