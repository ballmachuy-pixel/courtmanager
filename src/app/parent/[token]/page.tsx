import { ParentService } from '@/lib/services/parent.service';
import { ProgressService } from '@/lib/services/progress.service';
import RadarChart from '@/app/(dashboard)/students/[id]/components/RadarChart';
import { Trophy, Calendar, Sparkles, Clock, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default async function ParentPortalPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  
  // 🚀 DEMO MODE HANDLING
  let data: any = null;
  let error: any = null;

  if (params.token === 'demo') {
    data = {
      parent: { id: 'demo-parent', full_name: 'Phụ huynh Demo', academy_id: 'demo-academy' },
      students: [{
        id: 'demo-student',
        full_name: 'Nguyễn Văn Demo',
        session_balance: 12,
        avatar_url: null,
        academy_id: 'demo-academy'
      }]
    };
  } else {
    const parentService = new ParentService();
    const result = await parentService.getChildrenByToken(params.token);
    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Liên kết đã hết hạn</h1>
        <p className="text-slate-500 max-w-xs">Vui lòng liên hệ với học viện để nhận đường dẫn truy cập mới nhất.</p>
      </div>
    );
  }

  const { parent, students } = data;
  const progressService = new ProgressService(parent.academy_id);
  const skills = progressService.getAvailableSkills();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
             <Sparkles size={12} className="text-amber-500" />
             <span>Cổng thông tin phụ huynh</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Chào <span className="text-purple-500">{parent.full_name}</span> 👋</h1>
          <p className="text-slate-500 text-sm">Dưới đây là cập nhật mới nhất về quá trình luyện tập của con.</p>
        </div>

        {/* Children List */}
        <div className="space-y-12">
          {students.map(async (student: any) => {
            let latestAssessment: any = null;
            
            if (params.token === 'demo') {
              latestAssessment = {
                scores: skills.map(s => ({ skill_id: s.id, score: Math.floor(Math.random() * 4) + 6 })) // Mock scores 6-10
              };
            } else {
              const res = await progressService.getLatestAssessment(student.id);
              latestAssessment = res.data;
            }
            
            const scores = latestAssessment?.scores || [];

            return (
              <div key={student.id} className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                {/* Child Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] p-8 shadow-2xl">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                  
                  <div className="relative flex items-center gap-6 mb-10">
                    <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 p-0.5">
                       <div className="w-full h-full bg-[#0a0a0a] rounded-[1.4rem] overflow-hidden flex items-center justify-center">
                          {student.avatar_url ? (
                            <Image src={student.avatar_url} alt={student.full_name} fill className="object-cover" />
                          ) : (
                            <span className="text-2xl font-black">{student.full_name.charAt(0)}</span>
                          )}
                       </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{student.full_name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Học viên chính thức</span>
                         <span className="text-slate-700">•</span>
                         <span className="text-xs text-slate-500 font-bold">Lớp nâng cao</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Clock size={12} className="text-emerald-500" /> Số buổi còn lại
                      </p>
                      <p className={`text-3xl font-black ${student.session_balance <= 1 ? 'text-red-500' : 'text-white'}`}>
                        {student.session_balance} <span className="text-xs font-medium text-slate-600">Buổi</span>
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Trophy size={12} className="text-amber-500" /> Hạng học viên
                      </p>
                      <p className="text-3xl font-black text-white">VIP</p>
                    </div>
                  </div>

                  {/* Skill Chart */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} className="text-amber-500" /> Biểu đồ năng lực
                    </p>
                    <div className="bg-white/[0.02] rounded-3xl border border-white/5 py-8 flex items-center justify-center">
                      <RadarChart data={skills.map(s => ({
                        skill_name: s.name,
                        score: scores.find((sc: any) => sc.skill_id === s.id)?.score || 0
                      }))} />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="px-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Calendar size={14} /> Hoạt động gần đây
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                          <CheckCircle size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Điểm danh có mặt</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Thứ 3, 12 Tháng 5</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Đúng giờ</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center py-12 border-t border-white/5">
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Powered by CourtManager</p>
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
