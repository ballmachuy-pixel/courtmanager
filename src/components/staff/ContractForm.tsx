'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCoachContract } from '@/app/actions/payroll';
import { Save, Loader2, ArrowLeft, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ContractForm({ staff }: { staff: any }) {
  const [baseSalary, setBaseSalary] = useState(staff.base_salary?.toString() || '0');
  const [perSessionRate, setPerSessionRate] = useState(staff.per_session_rate?.toString() || '0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateCoachContract(staff.id, Number(baseSalary), Number(perSessionRate));
      alert('Cập nhật hợp đồng lương thành công!');
      router.push('/staff');
      router.refresh();
    } catch (err) {
      alert('Đã xảy ra lỗi khi cập nhật hợp đồng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Link href="/staff" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Quay lại danh sách nhân sự
      </Link>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
        <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <DollarSign size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Hợp đồng Lương</h2>
              <p className="text-slate-400">Thiết lập cấu trúc lương cho HLV <span className="text-white font-bold">{staff.display_name}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Lương cứng hàng tháng (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₫</span>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Khoản cố định mỗi tháng không phụ thuộc số ca dạy.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Tiền lương trên mỗi ca dạy (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₫</span>
                  <input
                    type="number"
                    value={perSessionRate}
                    onChange={(e) => setPerSessionRate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Sẽ được nhân với số lượt Check-in GPS hợp lệ trong tháng.</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSubmitting ? 'ĐANG LƯU...' : 'LƯU HỢP ĐỒNG'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
