'use client';

import { useState } from 'react';
import { X, UserPlus, Loader2, Save, Phone } from 'lucide-react';
import { createQuickStaff } from '@/app/actions/staff';

interface QuickAddCoachModalProps {
  onSuccess: (newCoach: any) => void;
  onClose: () => void;
}

export function QuickAddCoachModal({ onSuccess, onClose }: QuickAddCoachModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createQuickStaff(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        onSuccess(res.member);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
              <UserPlus size={16} />
            </div>
            Thêm nhanh HLV
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Tên hiển thị *</label>
            <input 
              name="display_name" 
              type="text" 
              required 
              autoFocus
              placeholder="VD: Thầy Trung"
              className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-bold" 
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1 flex items-center gap-1.5">
              <Phone size={10} /> SỐ ĐIỆN THOẠI
            </label>
            <input 
              name="phone" 
              type="tel" 
              placeholder="09xxxxxxxx"
              className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3.5 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-bold" 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-600/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Tạo ngay</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
