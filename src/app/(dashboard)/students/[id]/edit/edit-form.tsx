'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { updateStudent } from '@/app/actions/student';
import { SKILL_LABELS, RELATIONSHIP_LABELS } from '@/lib/utils';

export function EditStudentForm({ studentId, initialData }: { studentId: string, initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('avatar') as File;
    if (file && file.size > 4 * 1024 * 1024) {
      setError('Kích thước ảnh đại diện quá lớn (tối đa 4MB). Vui lòng chọn ảnh khác.');
      setLoading(false);
      return;
    }

    try {
      const res = await updateStudent(studentId, formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        router.push(`/students/${studentId}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="animate-in flex flex-col gap-8 max-w-4xl mx-auto students-new-page">
      <div className="flex items-center gap-4">
        <Link href={`/students/${studentId}`} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sửa thông tin hồ sơ</h1>
          <p className="text-slate-500 mt-1">Cập nhật thông tin học viên {initialData.full_name}</p>
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
                   {initialData.avatar_url ? (
                     <img src={initialData.avatar_url} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg" />
                   ) : (
                     <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 border-dashed">
                        <User size={24} />
                     </div>
                   )}
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-slate-500 italic">Chọn ảnh mới để thay thế ảnh hiện tại</span>
                     <input name="avatar" type="file" accept="image/*" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500/10 file:text-pink-500 hover:file:bg-pink-500/20 cursor-pointer" />
                   </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Họ và tên học viên *</label>
                <input name="full_name" type="text" defaultValue={initialData.full_name} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-slate-600" placeholder="VD: Nguyễn Văn A" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ngày sinh</label>
                <input name="date_of_birth" type="date" defaultValue={initialData.date_of_birth} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all [color-scheme:dark]" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới tính</label>
                <select name="gender" defaultValue={initialData.gender || ""} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none">
                  <option value="" className="bg-slate-900">-- Chọn --</option>
                  <option value="male" className="bg-slate-900">Nam</option>
                  <option value="female" className="bg-slate-900">Nữ</option>
                  <option value="other" className="bg-slate-900">Khác</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trình độ đầu vào</label>
                <select name="skill_level" defaultValue={initialData.skill_level || "beginner"} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none">
                  <option value="beginner" className="bg-slate-900">Cơ bản (Beginner) - Phù hợp người mới</option>
                  <option value="intermediate" className="bg-slate-900">Trung bình (Intermediate) - Cần cải thiện kỹ năng</option>
                  <option value="advanced" className="bg-slate-900">Nâng cao (Advanced) - Đội tuyển / Thi đấu</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái học tập</label>
                <select name="is_active" defaultValue={initialData.is_active !== false ? "true" : "false"} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none">
                  <option value="true" className="bg-slate-900">Đang học (Học viên chính thức)</option>
                  <option value="false" className="bg-slate-900">Dừng học (Đã tạm nghỉ)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú sức khỏe (nếu có)</label>
                <textarea 
                  name="health_notes" 
                  defaultValue={initialData.health_notes || ""}
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
                <input name="parent_name" type="text" defaultValue={initialData.parent?.parent_name || ""} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600" placeholder="VD: Nguyễn Văn B" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số điện thoại *</label>
                <input name="phone" type="tel" defaultValue={initialData.parent?.phone || ""} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600" placeholder="09xxxxxxxxx" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mối quan hệ</label>
                <select name="relationship" defaultValue={initialData.parent?.relationship || "mother"} className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none">
                  <option value="mother" className="bg-slate-900">Mẹ</option>
                  <option value="father" className="bg-slate-900">Bố</option>
                  <option value="guardian" className="bg-slate-900">Người giám hộ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-2">
          <Link href={`/students/${studentId}`} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
            Hủy bỏ
          </Link>
          <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 hover:scale-[1.02]" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Lưu thay đổi</>}
          </button>
        </div>
      </form>
    </div>
  );
}
