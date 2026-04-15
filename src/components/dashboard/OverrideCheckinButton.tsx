'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { overrideCheckin } from '@/app/actions/coach';

export default function OverrideCheckinButton({ checkinId }: { checkinId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleOverride = () => {
    if (!confirm('Bạn có chắc chắn muốn xác nhận thủ công cho giáo viên này?')) return;
    
    startTransition(async () => {
      try {
        await overrideCheckin(checkinId);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Lỗi khi xác nhận hộ');
      }
    });
  };

  return (
    <button 
      onClick={handleOverride}
      disabled={isPending}
      className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
      title="Xác nhận hộ (Override)"
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
      Duyệt Hợp Lệ
    </button>
  );
}
