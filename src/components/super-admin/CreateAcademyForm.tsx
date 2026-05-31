'use client';

import { useState } from 'react';
import { createAcademyAction } from '@/app/actions/super-admin';

export default function CreateAcademyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await createAcademyAction(formData);
      setIsOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo học viện.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
      >
        + Thêm Học viện mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">Khởi tạo Học viện</h2>
              <p className="text-xs text-white/50 mt-1">Thiết lập môi trường làm việc mới cho đối tác.</p>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Tên Học viện</label>
                <input 
                  name="name"
                  required
                  placeholder="VD: Sunset Academy Thái Nguyên"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Slug (URL)</label>
                <input 
                  name="slug"
                  required
                  placeholder="vd: sunset-tn"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block">Email Quản Lý (Tùy chọn)</label>
                <input 
                  name="ownerEmail"
                  type="email"
                  placeholder="admin@academy.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang khởi tạo...' : 'Xác nhận Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
