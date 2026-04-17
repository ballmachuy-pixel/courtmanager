'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, MapPin, Phone, AlertCircle, Loader2, Plus, CheckCircle } from 'lucide-react';
import { createStudent } from '@/app/actions/student';
import { SPORT_TYPES } from '@/lib/constants';
import { SKILL_LABELS, RELATIONSHIP_LABELS } from '@/lib/utils';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitMode, setSubmitMode] = useState<'view' | 'add_more'>('view');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData(form);
    const file = formData.get('avatar') as File;
    if (file && file.size > 4 * 1024 * 1024) {
      setError('Kích thước ảnh đại diện quá lớn (tối đa 4MB). Vui lòng chọn ảnh khác.');
      setLoading(false);
      return;
    }

    try {
      const res = await createStudent(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        if (submitMode === 'view') {
          // Sang luôn trang hồ sơ để ghi danh lớp cho nhanh
          router.push(`/students/${res.id}`);
        } else {
          // Thêm người nữa: Xóa trắng form, hiện thông báo
          form.reset();
          const name = formData.get('full_name') as string;
          setSuccessMsg(`Đã lưu thành công học viên: ${name}. Bạn có thể điền tiếp.`);
          setLoading(false);
          // Tự tắt thông báo sau 5 giây
          setTimeout(() => setSuccessMsg(''), 5000);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="animate-in flex flex-col gap-8 max-w-4xl mx-auto students-new-page">
      <div className="flex items-center gap-4">
        <Link href="/students" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Thêm hồ sơ mới</h1>
          <p className="text-slate-500 mt-1">Đăng ký mới học viên vào hệ thống quản lý</p>
        </div>
      </div>

      {successMsg && (
        <div className="animate-in fade-in slide-in-from-top-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium p-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-medium p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass-card p-0 overflow-hidden">
          {/* Thông tin Vận động viên */}
          <div className="p-8 border-b border-white/5">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500">
                <User size={18} />
              </div>
              Thông tin Vận động viên
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ảnh chân dung</label>
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 border-dashed">
                      <User size={24} />
                   </div>
                   <input name="avatar" type="file" accept="image/*" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500/10 file:text-pink-500 hover:file:bg-pink-500/20 cursor-pointer" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Họ và tên học viên *</label>
                <input name="full_name" type="text" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-slate-600" placeholder="VD: Nguyễn Văn A" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày sinh</label>
                <input name="date_of_birth" type="date" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all [color-scheme:dark]" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới tính</label>
                <select name="gender" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none">
                  <option value="" className="bg-slate-900">-- Chọn --</option>
                  <option value="male" className="bg-slate-900">Nam</option>
                  <option value="female" className="bg-slate-900">Nữ</option>
                  <option value="other" className="bg-slate-900">Khác</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trình độ đầu vào</label>
                <select name="skill_level" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none" defaultValue="beginner">
                  <option value="beginner" className="bg-slate-900">Cơ bản (Beginner) - Phù hợp người mới</option>
                  <option value="intermediate" className="bg-slate-900">Trung bình (Intermediate) - Cần cải thiện kỹ năng</option>
                  <option value="advanced" className="bg-slate-900">Nâng cao (Advanced) - Đội tuyển / Thi đấu</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú sức khỏe (nếu có)</label>
                <textarea 
                  name="health_notes" 
                  className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-slate-600 resize-y min-h-[100px]" 
                  placeholder="VD: Hen suyễn, cận thị, dị ứng..."
                />
              </div>
            </div>
          </div>

          {/* Thông tin Phụ huynh */}
          <div className="p-8 bg-black/20">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Phone size={18} />
              </div>
              Thông tin Người quản lý / Giám hộ
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên người liên hệ phụ huynh *</label>
                <input name="parent_name" type="text" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600" placeholder="VD: Nguyễn Văn B" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại *</label>
                <input name="phone" type="tel" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600" placeholder="09xxxxxxxxx" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mối quan hệ</label>
                <select name="relationship" className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none" defaultValue="mother">
                  <option value="mother" className="bg-slate-900">Mẹ</option>
                  <option value="father" className="bg-slate-900">Bố</option>
                  <option value="grandfather" className="bg-slate-900">Ông</option>
                  <option value="grandmother" className="bg-slate-900">Bà</option>
                  <option value="guardian" className="bg-slate-900">Người giám hộ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2 flex-wrap pb-8">
          <Link href="/students" className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors mr-auto">
            Hủy bỏ
          </Link>
          <button 
            type="submit" 
            onClick={() => setSubmitMode('add_more')}
            className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50" 
            disabled={loading}
          >
            {loading && submitMode === 'add_more' ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Lưu & Nhập tiếp</>}
          </button>
          <button 
            type="submit" 
            onClick={() => setSubmitMode('view')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 hover:scale-[1.02] disabled:opacity-50" 
            disabled={loading}
          >
            {loading && submitMode === 'view' ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Lưu & Xem hồ sơ</>}
          </button>
        </div>
      </form>
    </div>
  );
}
