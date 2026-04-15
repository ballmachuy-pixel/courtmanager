'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, Edit, UserPlus, FileText, Plus, ChevronRight, MapPin } from 'lucide-react';
import { SKILL_LABELS, formatDate } from '@/lib/utils';
import { EnrollStudentModal } from './EnrollStudentModal';
import { AddScheduleModal } from './AddScheduleModal';
import { EditScheduleModal } from './EditScheduleModal';

export default function ClassDetailClient({ 
  clazz, 
  allStudents 
}: { 
  clazz: any, 
  allStudents: any[] 
}) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const enrolledStudents = clazz.student_classes?.map((sc: any) => sc.students) || [];
  
  // Filter out students already in the class
  const enrolledIds = new Set(enrolledStudents.map((s: any) => s.id));
  const availableStudents = allStudents.filter(s => !enrolledIds.has(s.id));

  return (
    <div className="animate-in flex flex-col gap-8 classes-detail-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/classes" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{clazz.name}</h1>
            <p className="text-slate-500 mt-1 font-medium">
              {clazz.age_group ? `${clazz.age_group} • ` : ''} 
              {SKILL_LABELS[clazz.skill_level] || clazz.skill_level || 'Mọi trình độ'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/classes/${clazz.id}/edit`} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-white/10">
            <Edit size={18} /> Sửa thông tin
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex flex-col items-center justify-center p-6 text-center group">
          <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-3 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Học viên</div>
          <div className="text-3xl font-black text-white">
            {enrolledStudents.length} <span className="text-lg text-slate-500 font-medium">/ {clazz.max_students}</span>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center justify-center p-6 text-center group">
           <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Lịch học</div>
          <div className="text-3xl font-black text-white">
            {clazz.schedules?.length || 0} <span className="text-lg text-slate-500 font-medium">buổi/tuần</span>
          </div>
        </div>
        <div className="glass-card flex flex-col items-center justify-center p-6 text-center group">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
            <UserPlus size={24} />
          </div>
          <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Huấn luyện viên</div>
          {clazz.academy_members ? (
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">{clazz.academy_members.display_name.charAt(0)}</div>
                <span className="text-white font-bold text-lg">{clazz.academy_members.display_name}</span>
             </div>
          ) : (
            <span className="text-slate-500 font-medium italic">Chưa phân công</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Class Students List */}
        <div className="glass-card p-0 flex flex-col h-[500px]">
          <div className="p-5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500"><Users size={18} /></div> 
              Danh sách học viên
            </h3>
            <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20" onClick={() => setShowEnrollModal(true)}>
              <UserPlus size={16} /> Thêm HV
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {enrolledStudents.length > 0 ? (
              <ul className="flex flex-col gap-2 p-2">
                {enrolledStudents.map((s: any) => (
                  <li key={s.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex items-center justify-between transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold border border-white/10 group-hover:border-pink-500/30 transition-colors">
                         {s.avatar_url ? <img src={s.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" /> : s.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{s.full_name}</div>
                        <div className="text-[11px] text-pink-400 font-bold uppercase tracking-wider mt-0.5">{SKILL_LABELS[s.skill_level] || s.skill_level}</div>
                      </div>
                    </div>
                    <Link href={`/students/${s.id}`} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-pink-500 hover:text-white transition-all">
                      <FileText size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                 <Users size={48} className="text-slate-600 mb-4" />
                 <p className="text-slate-400 text-sm font-medium">Chưa có học viên nào tham gia</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule View */}
        <div className="glass-card p-0 flex flex-col h-[500px]">
          <div className="p-5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
            <h3 className="font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500"><Clock size={18} /></div> 
              Lịch học hàng tuần
            </h3>
            <button className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all" onClick={() => setShowScheduleModal(true)}>
              <Plus size={16} /> Thêm ca
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {clazz.schedules && clazz.schedules.length > 0 ? (
              <div className="flex flex-col gap-4">
                {clazz.schedules.map((schedule: any) => {
                  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                  return (
                    <div key={schedule.id} className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5 shadow-inner">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Thứ</span>
                            <span className="text-lg font-black text-white">{schedule.day_of_week === 0 ? 'CN' : schedule.day_of_week + 1}</span>
                         </div>
                         <div>
                           <div className="text-base font-black text-purple-400 mb-1">{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</div>
                           <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><MapPin size={12}/> {schedule.location || 'Chưa xếp sân'}</div>
                         </div>
                      </div>
                      <div className="flex">
                        <button 
                          onClick={() => setEditingSchedule(schedule)}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-500 hover:text-white transition-all"
                        >
                          <Edit size={14}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                 <Clock size={48} className="text-slate-600 mb-4" />
                 <p className="text-slate-400 text-sm font-medium">Chưa có lịch học nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEnrollModal && (
        <EnrollStudentModal 
          classId={clazz.id}
          availableStudents={availableStudents}
          onClose={() => setShowEnrollModal(false)}
        />
      )}

      {showScheduleModal && (
        <AddScheduleModal 
          classId={clazz.id}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {editingSchedule && (
        <EditScheduleModal 
          classId={clazz.id}
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
        />
      )}
    </div>
  );
}
