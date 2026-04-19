'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { createClass, getCoaches } from '@/app/actions/class';
import { AGE_GROUPS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function NewClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coaches, setCoaches] = useState<{id: string; display_name: string; role: string}[]>([]);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const data = await getCoaches();
        if (data) setCoaches(data);
      } catch (err) {
        console.error('Failed to fetch coaches:', err);
      }
    };
    fetchCoaches();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await createClass(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="animate-in flex flex-col gap-8 max-w-4xl mx-auto classes-new-page">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Link href="/classes" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Thêm lớp học mới</h1>
          <p className="text-slate-500 mt-1">Tạo cơ cấu lớp học theo độ tuổi và trình độ</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-medium p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass-card p-0 overflow-hidden">
          <div className="p-8 bg-black/10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên lớp hiển thị *</label>
                <input name="name" type="text" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-slate-600" placeholder="VD: U10 Bóng rổ Cơ bản" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Độ tuổi</label>
                <select name="age_group" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none">
                  <option value="" className="bg-slate-900">-- Mọi độ tuổi --</option>
                  {AGE_GROUPS.map((age) => (
                    <option key={age} value={age} className="bg-slate-900">{age}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trình độ</label>
                <select name="skill_level" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none" defaultValue="beginner">
                  <option value="" className="bg-slate-900">-- Chung --</option>
                  <option value="beginner" className="bg-slate-900">Cơ bản (Beginner)</option>
                  <option value="intermediate" className="bg-slate-900">Trung bình (Intermediate)</option>
                  <option value="advanced" className="bg-slate-900">Nâng cao (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số lượng học viên tối đa</label>
                <input name="max_students" type="number" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all" defaultValue={20} min={1} required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Đội ngũ Huấn luyện viên (Chọn 3 hoặc nhiều hơn) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
                  {coaches.map(c => (
                    <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10 group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          name="coach_ids" 
                          value={c.id} 
                          className="peer appearance-none w-5 h-5 border border-white/20 rounded-md checked:bg-pink-500 checked:border-pink-500 transition-all"
                        />
                        <svg className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{c.display_name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">* Thầy đầu tiên được chọn sẽ là HLV chính của lớp.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-4 mt-2">
          <Link href="/classes" className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
            Hủy bỏ
          </Link>
          <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 hover:scale-[1.02]" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Lưu lớp học</>}
          </button>
        </div>
      </form>
    </div>
  );
}
