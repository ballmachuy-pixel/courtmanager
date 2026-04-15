'use client';

import { useState } from 'react';
import { X, Search, UserPlus, Loader2, CheckSquare, Square } from 'lucide-react';
import { enrollStudents } from '@/app/actions/class';
import { SKILL_LABELS } from '@/lib/utils';

interface Student {
  id: string;
  full_name: string;
  skill_level: string;
}

interface EnrollStudentModalProps {
  classId: string;
  availableStudents: Student[];
  onClose: () => void;
}

export function EnrollStudentModal({ classId, availableStudents, onClose }: EnrollStudentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredStudents = availableStudents.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  const toggleStudent = (studentId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleEnrollBulk = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    setError('');
    try {
      await enrollStudents(Array.from(selectedIds), classId);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thêm học viên');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/60 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex flex-shrink-0 items-center justify-between border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
              <UserPlus size={16} />
            </div>
            Thêm học viên vào lớp
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 overflow-hidden">
          {/* Search */}
          <div className="flex-shrink-0 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
              placeholder="Tìm tên học viên..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="flex-shrink-0 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

          {/* Student List */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 pr-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => toggleStudent(student.id)}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer group ${
                    selectedIds.has(student.id) 
                      ? 'bg-pink-500/10 border-pink-500/40 shadow-inner shadow-pink-500/10' 
                      : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-sm border border-white/10">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-white">{student.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {SKILL_LABELS[student.skill_level as keyof typeof SKILL_LABELS] || student.skill_level || 'Mới'}
                      </div>
                    </div>
                  </div>
                  <div className="pr-1 text-slate-400 group-hover:text-slate-300">
                    {selectedIds.has(student.id) ? (
                      <CheckSquare size={20} className="text-pink-500" />
                    ) : (
                      <Square size={20} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm font-medium">
                Không tìm thấy học viên phù hợp
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex-shrink-0 border-t border-white/5 bg-slate-900/50 rounded-b-2xl flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">
            Đã chọn: <strong className="text-white">{selectedIds.size}</strong> học viên
          </span>
          <button 
            onClick={handleEnrollBulk}
            disabled={selectedIds.size === 0 || loading}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Lưu vào lớp'}
          </button>
        </div>
      </div>
    </div>
  );
}
