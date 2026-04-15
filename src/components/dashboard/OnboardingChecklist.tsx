'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle, Users, BookOpen, Calendar, ChevronRight, X } from 'lucide-react';

interface Props {
  studentCount: number;
  classCount: number;
}

export default function OnboardingChecklist({ studentCount, classCount }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // If both are completed and user has dismissed, don't show.
  // Actually, if both are completed, we just don't show it at all.
  const isCompleted = studentCount > 0 && classCount > 0;
  
  if (isCompleted || dismissed) {
    return null;
  }

  const steps = [
    {
      title: 'Thêm Học viên đầu tiên',
      description: 'Trung tâm không thể hoạt động thiếu học viên',
      isDone: studentCount > 0,
      icon: Users,
      href: '/students/new',
      color: 'blue'
    },
    {
      title: 'Tạo Lớp học & Lịch học',
      description: 'Lớp học là nơi điểm danh và thu học phí',
      isDone: classCount > 0,
      icon: BookOpen,
      href: '/classes/new',
      color: 'purple'
    }
  ];

  const completedCount = steps.filter(s => s.isDone).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="mb-10 bg-slate-900/60 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-1 shadow-2xl shadow-pink-500/10 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="bg-slate-950/50 rounded-[1.35rem] p-6 relative z-10">
        <button 
          onClick={() => setDismissed(true)} 
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Khởi tạo Trung Tâm (Ngày 1)</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Hoàn thành các bước dưới đây để hệ thống tự động hóa mọi thứ!</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Tiến độ thiết lập</span>
              <span className="text-pink-400">{completedCount}/{steps.length} Hoàn thành</span>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => (
            <Link 
              key={idx}
              href={step.isDone ? '#' : step.href}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                step.isDone 
                  ? 'bg-emerald-500/10 border-emerald-500/20 cursor-default' 
                  : 'bg-white/5 border-white/10 hover:border-pink-500/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                step.isDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-pink-400'
              }`}>
                {step.isDone ? <CheckCircle size={20} /> : <step.icon size={20} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-sm ${step.isDone ? 'text-emerald-400 line-through opacity-80' : 'text-white group-hover:text-pink-400 transition-colors'}`}>{step.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              </div>
              {!step.isDone && (
                <div className="text-slate-600 group-hover:text-pink-500 transition-colors">
                  <ChevronRight size={20} />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
