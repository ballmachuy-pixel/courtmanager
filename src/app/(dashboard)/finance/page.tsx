import { getCurrentAcademyId } from '@/lib/server-utils';
import { FinanceService } from '@/lib/services/finance.service';
import { formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RecordPaymentForm from '@/components/finance/RecordPaymentForm';
import { StudentService } from '@/lib/services/student.service';

export default async function FinancePage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const financeService = new FinanceService(academyId);
  const studentService = new StudentService(academyId);

  const [
    { data: payments }, 
    { data: summary },
    { data: students },
    { data: packages }
  ] = await Promise.all([
    financeService.getPayments(),
    financeService.getFinanceSummary(),
    studentService.getAllStudents(),
    financeService.getTuitionPackages()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tài chính</h1>
          <p className="text-white/50 mt-1">Theo dõi dòng tiền, học phí và lịch sử giao dịch của học viện.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/finance/reports" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold transition-all hover:bg-white/5 flex items-center gap-2">
            <span>📊 Báo cáo</span>
          </Link>
          <Link href="/finance/packages" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold transition-all hover:bg-white/5">
            Gói học phí
          </Link>
          <Link href="/finance/payroll" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 text-sm font-bold text-indigo-400 transition-all hover:bg-indigo-500/20">
            Tính lương HLV
          </Link>
          <RecordPaymentForm 
            students={(students || []).map((s: any) => ({ id: s.id, display_name: s.full_name }))} 
            packages={(packages || []).map((p: any) => ({ id: p.id!, name: p.name, price: p.price }))} 
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-black mb-1">Tổng doanh thu</p>
          <p className="text-3xl font-mono text-emerald-400">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary?.totalRevenue || 0)}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-black mb-1">Học phí quá hạn</p>
          <p className="text-3xl font-mono text-rose-400">{summary?.overdueCount || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400 font-black mb-1">Sức khỏe tài chính</p>
          <p className="text-3xl font-mono text-indigo-400">Tốt</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-bold text-slate-200">Lịch sử giao dịch</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-white/30 border-b border-white/5">
                <th className="px-6 py-4 font-bold">Ngày</th>
                <th className="px-6 py-4 font-bold">Học viên</th>
                <th className="px-6 py-4 font-bold">Nội dung</th>
                <th className="px-6 py-4 font-bold">Hình thức</th>
                <th className="px-6 py-4 font-bold text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments?.map((payment: any) => (
                <tr key={payment.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-white/60">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{payment.students?.full_name || 'Học viên ẩn danh'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {payment.description || 'Đóng học phí'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase">
                      {payment.payment_method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-green-400">
                    +{new Intl.NumberFormat('vi-VN').format(payment.amount)}
                  </td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-white/20">
                    Chưa có giao dịch nào được ghi nhận.
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
