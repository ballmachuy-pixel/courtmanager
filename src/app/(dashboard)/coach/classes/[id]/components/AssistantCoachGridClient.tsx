'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Loader2, Users } from 'lucide-react';
import { markAssistantAttendance } from '@/app/actions/coach';

interface Coach {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface Props {
  academyId: string;
  scheduleId: string;
  headCoachId: string;
  allCoaches: Coach[];
  initialPresentCoachIds: string[];
}

export function AssistantCoachGridClient({ academyId, scheduleId, headCoachId, allCoaches, initialPresentCoachIds }: Props) {
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set(initialPresentCoachIds));
  const [loadingObj, setLoadingObj] = useState<Record<string, boolean>>({});

  // Filter out the head coach from the list
  const assistants = allCoaches.filter(c => c.id !== headCoachId);

  if (assistants.length === 0) return null;

  const handleToggle = async (assistantId: string) => {
    if ('vibrate' in navigator) navigator.vibrate(40);
    const isCurrentlyPresent = presentIds.has(assistantId);
    
    // Optimistic Update
    setPresentIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyPresent) next.delete(assistantId);
      else next.add(assistantId);
      return next;
    });

    setLoadingObj(prev => ({...prev, [assistantId]: true}));

    try {
      await markAssistantAttendance({
        academyId,
        scheduleId,
        assistantCoachId: assistantId,
        isPresent: !isCurrentlyPresent
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      setPresentIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyPresent) next.add(assistantId);
        else next.delete(assistantId);
        return next;
      });
      alert('Lỗi điểm danh HLV phụ');
    } finally {
      setLoadingObj(prev => ({...prev, [assistantId]: false}));
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Users size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Điểm danh HLV Phụ</h3>
          <p className="text-xs text-slate-400">Chọn các HLV đi dạy cùng ca này</p>
        </div>
      </div>

      <div className="space-y-3">
        {assistants.map(coach => {
          const isPresent = presentIds.has(coach.id);
          const isProcessing = loadingObj[coach.id];

          return (
            <button
              key={coach.id}
              onClick={() => handleToggle(coach.id)}
              disabled={isProcessing}
              className={`w-full text-left rounded-2xl p-3 flex items-center justify-between transition-all active:scale-[0.98] border ${
                isPresent 
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5' 
                  : 'bg-slate-950/50 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative ${isPresent ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                  {coach.avatar_url ? (
                    <Image src={coach.avatar_url} alt={coach.display_name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <span className={`text-sm font-black ${isPresent ? 'text-blue-400' : 'text-white/30'}`}>{coach.display_name.charAt(0)}</span>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 size={14} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${isPresent ? 'text-blue-400' : 'text-white'}`}>{coach.display_name}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isPresent ? 'text-blue-500/70' : 'text-slate-500'}`}>
                    {isPresent ? 'Đã bảo lãnh' : 'Chưa điểm danh'}
                  </p>
                </div>
              </div>
              <div className="pr-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isPresent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <CheckCircle size={14} strokeWidth={isPresent ? 3 : 2} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
