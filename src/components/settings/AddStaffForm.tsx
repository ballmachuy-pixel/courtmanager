'use client';

import { useState } from 'react';
import { addStaff } from '@/app/actions/settings';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

export default function AddStaffForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await addStaff(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset(); // Xoá form sau khi tạo
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2 animate-in mt-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm flex items-center gap-2 animate-in mt-2">
          <AlertCircle size={16} className="shrink-0" /> Thêm nhân sự thành công!
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Tên hiển thị</label>
          <input 
            name="display_name" 
            type="text" 
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium" 
            placeholder="VD: Cô Trang" 
            required 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Chức vụ</label>
          <select 
            name="role" 
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium appearance-none" 
            defaultValue="coach"
          >
            <option value="coach">Huấn luyện viên</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Mã đăng nhập (ID)</label>
          <input 
            name="employee_code" 
            type="text" 
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold uppercase tracking-wider" 
            placeholder="VD: HLV001" 
            required 
          />
          <p className="text-[10px] text-slate-500 font-medium">Dùng để đăng nhập hệ thống</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Mã PIN mặc định</label>
          <input 
            name="pin" 
            type="text" 
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold tracking-[0.2em]" 
            placeholder="VD: 123456" 
            pattern="[0-9]{4,6}" 
            title="Mã PIN phải từ 4-6 số" 
            required 
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-500 active:scale-95 transition-all shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:active:scale-100" 
        disabled={loading}
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <><Plus size={20} /> TẠO TÀI KHOẢN MỚI</>}
      </button>
    </form>
  );
}
