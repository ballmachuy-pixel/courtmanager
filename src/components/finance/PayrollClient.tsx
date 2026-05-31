'use client';

import React, { useState } from 'react';
import { generatePayrollForMonth, markPayrollPaid } from '@/app/actions/payroll';
import { DollarSign, Search, Calculator, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PayrollClient({ initialPayrolls, initialMonth, initialYear }: { initialPayrolls: Record<string, unknown>[], initialMonth: number, initialYear: number }) {
  const [data, setData] = useState(initialPayrolls);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [isLoading, setIsLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // For V2, we don't automatically generate when they select month. We just fetch (handled by page reload or we can add a fetch action).
  // But to keep it simple, the "Calculate" button will trigger generation.

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generatePayrollForMonth(month, year);
      if (result.success) {
        alert(`Đã tính toán xong bảng lương cho ${result.count} HLV.`);
        window.location.reload(); // Reload to get fresh data
      }
    } catch (err) {
      alert('Lỗi khi tính toán bảng lương');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (payroll: { id: string; net_amount: number; academy_members: { profiles: { full_name: string } } }) => {
    if (!confirm(`Xác nhận đã thanh toán ${formatCurrency(payroll.net_amount)} cho HLV ${payroll.academy_members.profiles.full_name}?`)) return;
    
    setPayingId(payroll.id);
    try {
      await markPayrollPaid(payroll.id);
      window.location.reload();
    } catch (err) {
      alert('Đã xảy ra lỗi khi thanh toán.');
    } finally {
      setPayingId(null);
    }
  };

  const totalPayroll = data.reduce((sum, item: any) => sum + item.net_amount, 0);

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
          onClick={() => window.location.search = `?month=${month}&year=${year}`} // A simple way to navigate
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors border border-white/10"
        >
          <Search size={18} /> Xem
        </button>

        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="ml-auto bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
          Chạy tính lương tháng {month}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Dự toán quỹ lương (Ròng)</p>
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
                <th className="px-6 py-4 font-bold text-right">Tổng thu nhập</th>
                <th className="px-6 py-4 font-bold text-right">Khấu trừ</th>
                <th className="px-6 py-4 font-bold text-right">Thực lãnh (Net)</th>
                <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-bold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((payroll: any) => (
                <React.Fragment key={payroll.id}>
                  <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === payroll.id ? null : payroll.id)}>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">
                        {payroll.academy_members.profiles.full_name.charAt(0)}
                      </div>
                      <div>
                        {payroll.academy_members.profiles.full_name}
                        <div className="text-[10px] text-white/40 font-normal">Mở xem chi tiết phiếu lương</div>
                      </div>
                      {expandedId === payroll.id ? <ChevronUp size={16} className="text-white/30 ml-auto" /> : <ChevronDown size={16} className="text-white/30 ml-auto" />}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      {formatCurrency(payroll.total_earnings)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-red-400">
                      {formatCurrency(payroll.total_deductions)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-emerald-400 text-lg">
                      {formatCurrency(payroll.net_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {payroll.status === 'paid' ? (
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
                      {payroll.status !== 'paid' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePay(payroll); }}
                          disabled={payingId === payroll.id}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {payingId === payroll.id ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                          Chốt lương
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs font-bold italic">Đã xong</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Items */}
                  {expandedId === payroll.id && (
                    <tr className="bg-black/20">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4">
                          <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3 border-b border-white/5 pb-2">Chi tiết các khoản (Audit Trail)</h4>
                          <div className="space-y-2">
                            {payroll.payroll_items.map((item: { id: string; item_type: string; description?: string; amount: number }) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${item.item_type === 'DEDUCTION' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                  {item.description || item.item_type}
                                </span>
                                <span className={`font-mono ${item.item_type === 'DEDUCTION' ? 'text-red-400' : 'text-slate-200'}`}>
                                  {item.item_type === 'DEDUCTION' ? '-' : '+'}{formatCurrency(item.amount)}
                                </span>
                              </div>
                            ))}
                            {payroll.payroll_items.length === 0 && (
                              <div className="text-slate-500 text-sm italic">Không có chi tiết.</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa có dữ liệu lương. Vui lòng nhấn &quot;Chạy tính lương&quot;.
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
