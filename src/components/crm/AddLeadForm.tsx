'use client';

import { useState } from 'react';
import { addLead } from '@/app/actions/crm';
import { Plus, X, Loader2 } from 'lucide-react';

export default function AddLeadForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addLead(
        formData.get('studentName') as string,
        formData.get('parentName') as string,
        formData.get('parentPhone') as string,
        (formData.get('dateOfBirth') as string) || null,
        formData.get('notes') as string
      );
      setIsOpen(false);
    } catch (err) {
      alert('Lỗi thêm học viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
      >
        <Plus size={18} /> Thêm khách hàng
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6">Thêm khách tiềm năng</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Tên học sinh *</label>
                <input required name="studentName" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Tên phụ huynh</label>
                  <input name="parentName" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="VD: Mẹ Lan" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">SĐT *</label>
                  <input required name="parentPhone" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="09..." />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Ngày sinh</label>
                <input type="date" name="dateOfBirth" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Ghi chú</label>
                <textarea name="notes" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" placeholder="VD: Bé nhát, thích học ca tối..."></textarea>
              </div>
              
              <button 
                disabled={isSubmitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Tạo Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
