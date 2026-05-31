'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, PhoneCall, Loader2 } from 'lucide-react';
import { resolveActionItemAction } from '@/app/actions/action-items';

export default function CSKHActionWidget({ initialItems = [] }: { initialItems: { id: string; title?: string; description?: string; students?: { full_name?: string } }[] }) {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setLoadingId(id);
    const result = await resolveActionItemAction(id);
    setLoadingId(null);
    
    if (result.error) {
      alert(result.error);
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  };

  if (items.length === 0) return null; // Don't show if empty

  return (
    <div className="glass-card p-6 mb-6 relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-600/5 border-amber-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-amber-500">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>Cần CSKH Gấp</span>
          </div>
          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            {items.length} NHIỆM VỤ
          </span>
        </h3>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map(item => (
            <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
              <div>
                <p className="font-bold text-sm text-white mb-1">{item.students?.full_name || 'Học viên ẩn'}</p>
                <p className="text-xs text-amber-400/80 font-medium flex items-center gap-1">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[10px] text-white/50 mt-1 line-clamp-1" title={item.description}>{item.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all"
                  title="Gọi điện"
                >
                  <PhoneCall size={14} />
                </button>
                <button 
                  onClick={() => handleResolve(item.id)}
                  disabled={loadingId === item.id}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-xs font-bold text-slate-300 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-1"
                >
                  {loadingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Đã xử lý</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
