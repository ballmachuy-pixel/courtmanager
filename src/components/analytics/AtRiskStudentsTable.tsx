'use client';

import { AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AtRiskStudent {
  student_id: string;
  name: string;
  absent_count: number;
  last_absent_date: string;
}

export default function AtRiskStudentsTable({ students }: { students: AtRiskStudent[] }) {
  if (!students || students.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
        <div className="bg-slate-950/50 rounded-[1.35rem] p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-white font-bold text-lg">Hệ thống an toàn</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            Tất cả học viên đều đang duy trì mức độ chuyên cần tốt. Không có ai rơi vào danh sách cảnh báo (Nghỉ ≥2 buổi).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-1 shadow-xl shadow-rose-900/40 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="bg-slate-950/50 rounded-[1.35rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
             <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-rose-400">Danh Sách Học Viên Báo Động</h3>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Nghỉ từ 2 buổi trở lên trong tháng này</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rose-500/20 bg-rose-500/5">
                <th className="p-3 text-[10px] uppercase font-black text-rose-400/70 tracking-wider rounded-tl-xl pl-4">Học viên</th>
                <th className="p-3 text-[10px] uppercase font-black text-rose-400/70 tracking-wider">Số buổi vắng</th>
                <th className="p-3 text-[10px] uppercase font-black text-rose-400/70 tracking-wider">Lần vắng gần nhất</th>
                <th className="p-3 text-[10px] uppercase font-black text-rose-400/70 tracking-wider text-right rounded-tr-xl pr-4">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((s, idx) => (
                <tr key={s.student_id} className="hover:bg-rose-500/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-white/10 group-hover:border-rose-500/30 transition-all">
                          {idx + 1}
                      </div>
                      <span className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black">
                      {s.absent_count}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400 text-sm font-medium">{s.last_absent_date}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/students/${s.student_id}`}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent hover:border-white/10 transition-all"
                        title="Hồ sơ chi tiết"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button className="h-8 px-3 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all outline-none border border-rose-500/20 hover:border-rose-500">
                        <Phone size={12} /> <span className="hidden sm:inline">Gọi Phụ huynh</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
