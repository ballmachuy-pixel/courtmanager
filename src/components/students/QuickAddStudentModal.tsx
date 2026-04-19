'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2, Save, Phone, MapPin } from 'lucide-react';
import { createStudent } from '@/app/actions/student';

interface QuickAddStudentModalProps {
  classId: string;
  onSuccess: (newStudent: any) => void;
  onClose: () => void;
}

export function QuickAddStudentModal({ classId, onSuccess, onClose }: QuickAddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.append('class_id', classId); // Tự động ghi danh vào lớp hiện tại

    try {
      const res = await createStudent(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        onSuccess({ id: res.id, full_name: formData.get('full_name') });
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <UserPlus size={16} />
            </div>
            Thêm nhanh học sinh mới
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-[10px] text-emerald-500/70 italic mb-2">
            * Học sinh sẽ được tạo hồ sơ và ghi danh vào lớp này ngay lập tức.
          </p>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Họ tên học sinh *</label>
              <input name="full_name" type="text" required autoFocus placeholder="VD: Nguyễn Văn A" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Giới tính</label>
                <select name="gender" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 focus:outline-none text-sm appearance-none">
                  <option value="male" className="bg-slate-900">Nam</option>
                  <option value="female" className="bg-slate-900">Nữ</option>
                </select>
              </div>
              <div>
                 <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Trình độ</label>
                 <select name="skill_level" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 focus:outline-none text-sm appearance-none">
                   <option value="beginner" className="bg-slate-900">Cơ bản</option>
                   <option value="intermediate" className="bg-slate-900">Trung bình</option>
                 </select>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 mt-2">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 block ml-1">Thông tin phụ huynh *</label>
              <div className="space-y-4">
                <input name="parent_name" type="text" required placeholder="Tên phụ huynh" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-bold" />
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="phone" type="tel" required placeholder="Số điện thoại" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-bold" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Lưu & Ghi danh</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
