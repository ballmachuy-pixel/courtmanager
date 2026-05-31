'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCoachContract } from '@/app/actions/payroll';
import { Save, Loader2, ArrowLeft, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getICTDateString } from '@/lib/utils';

export default function ContractForm({ staff, initialContract, initialRates, classes }: { staff: Record<string, unknown>, initialContract: Record<string, unknown>, initialRates: Record<string, unknown>[], classes: Record<string, unknown>[] }) {
  const [baseSalary, setBaseSalary] = useState(initialContract?.base_salary?.toString() || '0');
  const [effectiveFrom, setEffectiveFrom] = useState<string>((initialContract?.effective_from as string) || getICTDateString());
  
  // Transform rates to state
  const [rates, setRates] = useState<{ classId: string, rateAmount: string }[]>(
    initialRates.length > 0 ? initialRates.map((r: any) => ({ classId: r.class_id as string, rateAmount: r.rate_amount.toString() })) : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddRate = () => {
    setRates([...rates, { classId: '', rateAmount: '0' }]);
  };

  const handleRemoveRate = (index: number) => {
    setRates(rates.filter((_, i) => i !== index));
  };

  const handleRateChange = (index: number, field: 'classId' | 'rateAmount', value: string) => {
    const newRates = [...rates];
    newRates[index][field] = value;
    setRates(newRates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Filter out empty classes
      const validRates = rates
        .filter(r => r.classId !== '')
        .map(r => ({ classId: r.classId, rateAmount: Number(r.rateAmount) }));

      await updateCoachContract(staff.id as string, Number(baseSalary), effectiveFrom as string, validRates);
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
    <div className="max-w-3xl mx-auto mt-8">
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
              <h2 className="text-2xl font-black text-white">Hợp đồng Lương (V2)</h2>
              <p className="text-slate-400 mt-1">Thiết lập chính sách lương cho HLV <span className="text-white font-bold">{staff.display_name as string}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Lương Cứng */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                1. Lương cơ bản & Thời hạn
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Ngày bắt đầu áp dụng
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Đơn giá Theo Lớp */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  2. Đơn giá Lương theo Lớp (Rates)
                </h3>
                <button type="button" onClick={handleAddRate} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-500/20 flex items-center gap-1">
                  <Plus size={14} /> Thêm Lớp
                </button>
              </div>

              {rates.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-4 text-center text-slate-500 text-sm italic">
                  Chưa cấu hình đơn giá theo lớp. Trợ giảng/HLV sẽ không được tính tiền theo ca dạy.
                </div>
              ) : (
                <div className="space-y-3">
                  {rates.map((rate, index) => (
                    <div key={index} className="flex gap-3 items-end bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Chọn Lớp học</label>
                        <select 
                          required
                          value={rate.classId}
                          onChange={e => handleRateChange(index, 'classId', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="">-- Chọn --</option>
                          {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Tiền/Ca (VNĐ)</label>
                        <input 
                          type="number"
                          required
                          value={rate.rateAmount}
                          onChange={e => handleRateChange(index, 'rateAmount', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveRate(index)} className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 mb-[1px]">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5">
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
