'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, AlertCircle, Megaphone, Info } from 'lucide-react';
import { createAnnouncement } from '@/app/actions/announcement';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await createAnnouncement(formData);
      router.push('/announcements');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      setLoading(false);
    }
  };

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20 max-w-3xl mx-auto">
      <Link href="/announcements" className="flex items-center gap-2 text-slate-400 hover:text-pink-400 text-sm font-medium transition-colors w-fit">
        <ArrowLeft size={16} /> Quay lại Thông báo
      </Link>

      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Tạo Thông Báo Mới</h1>
          <p className="text-slate-400 font-medium text-sm">Tin nhắn sẽ hiển thị trên Parent Portal và có thể gửi qua Email</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8 space-y-6">
            {/* Target */}
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1.5">
                <Megaphone size={10} /> Đối tượng nhận
              </label>
              <select name="target" defaultValue="all" className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium">
                <option value="all" className="bg-slate-900">Toàn bộ trung tâm (Tất cả phụ huynh)</option>
                <option value="class" disabled className="bg-slate-900">Một lớp học cụ thể (Đang nâng cấp)</option>
                <option value="student" disabled className="bg-slate-900">Một cá nhân (Đang nâng cấp)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Tiêu đề thông báo *</label>
              <input
                name="title"
                type="text"
                required
                placeholder="VD: Thông báo nghỉ lễ Quốc Khánh 2/9"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Nội dung chi tiết *</label>
              <textarea
                name="content"
                rows={8}
                required
                placeholder="Nhập nội dung cần thông báo..."
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm font-medium placeholder:text-slate-600 resize-y min-h-[120px]"
              />
            </div>

            {/* Hint */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-start gap-3">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Thông báo sẽ được lưu vào hệ thống và hiển thị trên Parent Portal. Email tự động sẽ được gửi khi tích hợp Resend/Zalo ZNS.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/announcements" className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            Hủy
          </Link>
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-3 rounded-xl text-sm font-black flex items-center gap-3 transition-all shadow-xl shadow-amber-600/25 hover:shadow-amber-500/40 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Đăng thông báo</>}
          </button>
        </div>
      </form>
    </div>
  );
}
