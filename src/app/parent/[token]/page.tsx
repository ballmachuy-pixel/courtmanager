import { getParentPortalData } from '@/app/actions/parent';
import Image from 'next/image';
import { 
  CheckCircle, XCircle, Clock, Calendar, 
  Phone, MapPin, Info, ArrowLeft, Trophy, Star, Sparkles,
  ShieldCheck, Share2, MessageCircle
} from 'lucide-react';
import { formatCurrency, formatDate, ATTENDANCE_LABELS, SKILL_LABELS } from '@/lib/utils';
import Link from 'next/link';

export default async function ParentPortalPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const data = await getParentPortalData(params.token);

  if ('error' in data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
           <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-4">Liên kết không khả dụng</h1>
        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
          Liên kết truy cập này đã hết hạn hoặc không tồn tại. Phụ huynh vui lòng liên hệ trung tâm để nhận mã truy cập mới.
        </p>
        <Link href="/" className="btn btn-secondary px-8 py-4 rounded-2xl font-bold">
           Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const { student, attendances, payments } = data;
  const academy = data.academy as { name?: string; address?: string; phone?: string } | undefined;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 animate-in">
      {/* --- PREMIUM HERO SECTION --- */}
      <div className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-br from-pink-600 to-purple-800 -z-10 rounded-b-[4rem] shadow-2xl shadow-pink-900/40" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white mb-8 border border-white/20">
                <ShieldCheck size={12} />
                <span>Parent Portal Secure Access</span>
             </div>

              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/30 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden bg-slate-900">
                   {student.avatar_url ? (
                      <Image 
                        src={student.avatar_url} 
                        alt={student.full_name} 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover rounded-[2rem]" 
                      />
                   ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl font-black text-white rounded-[2rem]">
                         {student.full_name.charAt(0)}
                      </div>
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg border-4 border-slate-950 text-slate-950">
                   <Trophy size={18} />
                </div>
             </div>

             <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{student.full_name}</h1>
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">{academy?.name || 'Sunday - Sunset Academy'}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                <span className="text-xs font-bold text-amber-300">Level: {student.skill_level ? (SKILL_LABELS[student.skill_level as keyof typeof SKILL_LABELS] || student.skill_level) : 'Tân binh'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT CARDS --- */}
      <div className="max-w-md mx-auto px-6 -mt-12 space-y-6">
        
        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-4">
           <div className="glass-card p-5 text-center flex flex-col items-center">
              <span className="text-3xl font-black text-emerald-400 mb-1">{attendances.filter(a => a.status === 'present').length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Buổi tham gia</span>
           </div>
           <div className="glass-card p-5 text-center flex flex-col items-center">
              <span className="text-3xl font-black text-red-500 mb-1">{attendances.filter(a => a.status === 'absent').length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Buổi vắng</span>
           </div>
        </div>

        {/* TECHNICAL FOCUS BANNER */}
        <div className="glass-card p-8 bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border-indigo-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all"></div>
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/10">
                 <Trophy size={28} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Tập trung chuyên môn</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[240px]">
                 Đam mê dẫn lối thành công. Chúng tôi ưu tiên phát triển kỹ năng và tư duy thể thao vượt trội cho học viên.
              </p>
              <div className="mt-6 flex gap-2">
                 <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
                 <div className="h-1 w-2 bg-indigo-500/30 rounded-full"></div>
                 <div className="h-1 w-2 bg-indigo-500/30 rounded-full"></div>
              </div>
           </div>
        </div>

        {/* ATTENDANCE TIMELINE */}
        <div className="glass-card overflow-hidden">
           <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-3 text-white">
                 <Calendar size={20} className="text-indigo-500" />
                 <span>Nhật ký tập luyện</span>
              </h3>
              <Star size={16} className="text-amber-400 fill-amber-400" />
           </div>
           
           <div className="p-2">
             {attendances.length === 0 ? (
               <div className="py-12 text-center text-slate-600 italic text-sm">Chưa có dữ liệu bài tập gần đây</div>
             ) : (
               <div className="space-y-1">
                 {attendances.map((a, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                         a.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 
                         a.status === 'absent' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                         {a.status === 'present' ? <CheckCircle size={22} /> : a.status === 'absent' ? <XCircle size={22} /> : <Clock size={22} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-white">{formatDate(a.date)}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-black truncate">
                            {(() => {
                               const classData = Array.isArray(a.classes) ? a.classes[0] : a.classes;
                               return classData?.name || 'Buổi tập Basketball';
                            })()}
                         </p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-tighter shrink-0 ${
                         a.status === 'present' ? 'bg-emerald-500/20 text-emerald-500' : 
                         a.status === 'absent' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                         {ATTENDANCE_LABELS[a.status] || a.status}
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* SUPPORT / CONTACT */}
        <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 text-center relative overflow-hidden group">
           <MessageCircle className="w-20 h-20 text-white/5 absolute -right-6 -bottom-6 group-hover:scale-125 transition-transform duration-700" />
           <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Trợ giúp Phụ huynh</p>
           <h4 className="text-lg font-bold text-white mb-2">Đội ngũ Sunday - Sunset luôn sẵn sàng</h4>
           <p className="text-xs text-slate-400 mb-8 leading-relaxed">Quý phụ huynh cần khiếu nại điểm danh hoặc hỗ trợ vận chuyển, vui lòng liên hệ trực tiếp HLV.</p>
           
           <div className="grid grid-cols-2 gap-4 relative z-10">
              <a href={`tel:${academy?.phone || '0392412022'}`} className="flex flex-col items-center gap-2 bg-white text-slate-950 p-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95">
                 <Phone size={20} />
                 <span className="text-xs">Hotline</span>
              </a>
              <button className="flex flex-col items-center gap-2 bg-white/5 text-white p-4 rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all">
                 <Share2 size={20} />
                 <span className="text-xs">Chia sẻ</span>
              </button>
           </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
         <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
            <Star size={10} />
            <span>Since 2020 • Thai Nguyen</span>
            <Star size={10} />
         </div>
      </div>
    </div>
  );
}
