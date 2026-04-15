'use client';

import { MapPin, Navigation, Clock, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CheckinHistoryBoard({ checkins }: { checkins: any[] }) {
  if (!checkins || checkins.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
        <div className="bg-slate-950/50 rounded-[1.35rem] p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mb-4">
            <Clock size={32} />
          </div>
          <h3 className="text-white font-bold text-lg">Chưa có lịch sử điểm danh</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Trong 30 ngày qua chưa có HLV nào thực hiện check-in hoặc hệ thống chưa ghi nhận dữ liệu.
          </p>
        </div>
      </div>
    );
  }

  const validCount = checkins.filter(c => c.is_valid).length;
  const invalidCount = checkins.length - validCount;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
             <ShieldCheck size={24} />
           </div>
           <div>
             <div className="text-[10px] uppercase font-black text-emerald-500/70 tracking-wider">Hợp lệ (Đúng vị trí)</div>
             <div className="text-2xl font-black text-emerald-400">{validCount}</div>
           </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
             <ShieldAlert size={24} />
           </div>
           <div>
             <div className="text-[10px] uppercase font-black text-red-500/70 tracking-wider">Vi phạm (Sai vị trí)</div>
             <div className="text-2xl font-black text-red-400">{invalidCount}</div>
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40 overflow-hidden">
        <div className="bg-slate-950/50 rounded-[1.35rem] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Huấn luyện viên</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Trạng thái Check-in</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Thông tin lớp</th>
                <th className="p-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Thời gian ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {checkins.map((c: any) => {
                const isValid = c.is_valid;
                const className = c.schedules?.classes?.name || 'Không rõ lớp';
                const date = new Date(c.created_at);
                
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                           {c.academy_members?.display_name?.charAt(0).toUpperCase() || 'H'}
                        </div>
                        <span className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">
                          {c.academy_members?.display_name || 'Huấn luyện viên'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {isValid ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <CheckCircle2 size={14} /> Hợp lệ
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">
                          <XCircle size={14} /> Vi phạm GPS
                        </div>
                      )}
                      {!isValid && c.distance_m && (
                        <div className="text-[10px] text-slate-500 font-medium mt-1 ml-1 flex items-center gap-1">
                          <Navigation size={10} /> Xa {Math.round(c.distance_m)}m
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-white mb-0.5">{className}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={10} /> Quẹt thẻ tại sân
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-slate-300">
                        {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(c.created_at)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
