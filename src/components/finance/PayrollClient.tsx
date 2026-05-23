'use client';

import { useState } from 'react';
import { calculateMonthlyPayroll, paySalary } from '@/app/actions/payroll';
import { DollarSign, Search, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function PayrollClient({ initialData, initialMonth, initialYear }: { initialData: any[], initialMonth: number, initialYear: number }) {
  const [data, setData] = useState(initialData);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [isLoading, setIsLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    try {
      const results = await calculateMonthlyPayroll(month, year);
      setData(results);
    } catch (err) {
      alert('Lỗi khi tính toán bảng lương');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (coach: any) => {
    if (!confirm(`Xác nhận đã thanh toán ${formatCurrency(coach.total_amount)} cho HLV ${coach.display_name}?`)) return;
    
    setPayingId(coach.manager_id);
    try {
      await paySalary(coach.manager_id, month, year, coach.base_amount, coach.session_count, coach.session_bonus, coach.total_amount);
      // Refresh data
      handleFetch();
    } catch (err) {
      alert('Đã xảy ra lỗi khi thanh toán.');
    } finally {
      setPayingId(null);
    }
  };

  const totalPayroll = data.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Tháng</label>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Năm</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[year - 1, year, year + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleFetch}
          disabled={isLoading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Lấy dữ liệu
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Dự toán quỹ lương tháng {month}/{year}</p>
          <h2 className="text-4xl font-mono font-black text-white">{formatCurrency(totalPayroll)}</h2>
        </div>
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <DollarSign size={32} className="text-indigo-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-white/40">
                <th className="px-6 py-4 font-bold">HLV</th>
                <th className="px-6 py-4 font-bold text-right">Ca dạy</th>
                <th className="px-6 py-4 font-bold text-right">Lương ca</th>
                <th className="px-6 py-4 font-bold text-right">Lương cứng</th>
                <th className="px-6 py-4 font-bold text-right">Tổng cộng</th>
                <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((coach) => (
                <tr key={coach.manager_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    {coach.display_name}
                    {coach.per_session_rate === 0 && coach.base_amount === 0 && (
                      <span className="block text-[10px] text-amber-500 font-normal mt-1 flex items-center gap-1">
                        Chưa cài hợp đồng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-indigo-400 font-bold">
                    {coach.session_count} <span className="text-xs text-slate-500">ca</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">
                    {formatCurrency(coach.session_bonus)}
                    <div className="text-[10px] text-slate-500">({formatCurrency(coach.per_session_rate)}/ca)</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">
                    {formatCurrency(coach.base_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-emerald-400 text-lg">
                    {formatCurrency(coach.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {coach.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        Chờ thanh toán
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {coach.status !== 'paid' ? (
                      <button
                        onClick={() => handlePay(coach)}
                        disabled={payingId === coach.manager_id}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {payingId === coach.manager_id ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                        Chốt lương
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs font-bold italic">Đã xong</span>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Chưa có dữ liệu HLV nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
