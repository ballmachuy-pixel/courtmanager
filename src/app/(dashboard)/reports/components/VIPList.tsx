import { getTopVipStudents } from '@/app/actions/reports';
import Image from 'next/image';
import Link from 'next/link';
import { Crown, Sparkles, ChevronRight, Trophy } from 'lucide-react';

export default async function VIPList() {
  const vipList = await getTopVipStudents();

  if (!vipList || vipList.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-amber-500/20 to-orange-500/5 border border-amber-500/30 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-amber-900/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Crown size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              Học Viên VIP <Trophy size={20} className="text-amber-500" />
            </h2>
            <p className="text-amber-500/70 text-sm font-bold uppercase tracking-widest mt-1">
              Top Điểm Danh Trọn Đời
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {vipList.map((student, index) => (
            <Link 
              href={`/students/${student.id}`} 
              key={student.id}
              className="bg-slate-950/60 hover:bg-slate-900/80 border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-amber-500/50 transition-colors">
                    {student.avatar_url ? (
                      <Image src={student.avatar_url} alt={student.full_name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <span className="text-lg font-black text-slate-500">{student.full_name.charAt(0)}</span>
                    )}
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-amber-500/40 border-2 border-slate-950">
                      1
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-400/40 border-2 border-slate-950">
                      2
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-orange-700 to-orange-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-orange-900/40 border-2 border-slate-950">
                      3
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">{student.full_name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-1">
                    <Sparkles size={10} className="inline mr-1 text-amber-500" />
                    {student.total_sessions} buổi học
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
