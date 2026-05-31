/* eslint-disable @next/next/no-img-element */
'use client';

import { Sparkles, Trophy, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface VIPStudent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  classCount: number;
  attendanceCount: number;
  vipScore: number;
}

interface Props {
  students: VIPStudent[];
}

export default function TopVIPStudents({ students }: Props) {
  if (!students || students.length === 0) {
    return (
      <div className="glass-card p-6 opacity-60">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Top Học Viên VIP</h3>
        <p className="text-xs italic text-slate-500">Chưa có đủ dữ liệu để xếp hạng VIP.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Trophy size={16} />
          Top Học Viên VIP
        </h3>
        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">Ưu tiên chăm sóc</span>
      </div>

      <div className="space-y-4">
        {students.map((student, index) => (
          <Link 
            href={`/students/${student.id}`} 
            key={student.id}
            className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-amber-400' : 'border-white/10'}`}>
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                  )}
                </div>
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full p-1 shadow-lg">
                    <Sparkles size={10} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{student.full_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Trophy size={10} /> {student.vipScore} điểm
                  </span>
                  <span className="text-[10px] text-slate-700">•</span>
                  <span className="text-[10px] text-slate-500">{student.classCount} khóa học</span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
