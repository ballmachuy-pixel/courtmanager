'use client';

import { useState } from 'react';
import { recordAssessmentAction } from '@/app/actions/progress';
import { Trophy, Star, MessageSquare, Loader2, Check } from 'lucide-react';
import RadarChart from './RadarChart';

interface Skill {
  id: string;
  name: string;
}

interface StudentAssessmentProps {
  studentId: string;
  skills: Skill[];
  latestAssessment?: any;
}

export default function StudentAssessment({ studentId, skills, latestAssessment }: StudentAssessmentProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    latestAssessment?.scores?.reduce((acc: any, s: any) => ({ ...acc, [s.skill_id]: s.score }), {}) ||
    skills.reduce((acc, s) => ({ ...acc, [s.id]: 5 }), {})
  );
  const [notes, setNotes] = useState(latestAssessment?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleScoreChange = (skillId: string, value: number) => {
    setScores(prev => ({ ...prev, [skillId]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const scoreArray = Object.entries(scores).map(([id, score]) => ({
      skill_id: id,
      skill_name: skills.find(s => s.id === id)?.name || id,
      score
    }));

    const res = await recordAssessmentAction({
      student_id: studentId,
      assessment_date: new Date().toISOString().split('T')[0],
      notes,
      scores: scoreArray
    });

    setIsSaving(false);
    if (res.success) {
      alert('Đã cập nhật đánh giá kỹ năng!');
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="glass-card p-8 space-y-8 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <Trophy size={22} className="text-amber-500" />
          <span>Đánh giá Kỹ năng</span>
        </h3>
        {latestAssessment && (
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            Cập nhật: {new Date(latestAssessment.assessment_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {skills.map(skill => (
            <div key={skill.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Star size={12} className="text-amber-500" />
                  {skill.name}
                </label>
                <span className="text-lg font-mono font-black text-amber-500">{scores[skill.id]}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={scores[skill.id]} 
                onChange={(e) => handleScoreChange(skill.id, parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5">
          <RadarChart data={skills.map(s => ({ skill_name: s.name, score: scores[s.id] }))} />
        </div>

        <div className="space-y-6">
          <div className="space-y-3 h-full flex flex-col">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare size={12} className="text-blue-500" />
              Nhận xét chuyên môn
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập nhận xét về sự tiến bộ, điểm mạnh và các mặt cần cải thiện của học viên..."
              className="flex-1 w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-amber-500/30 transition-all resize-none min-h-[150px]"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-amber-500/10"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
          LƯU KẾT QUẢ ĐÁNH GIÁ
        </button>
      </div>
    </div>
  );
}
