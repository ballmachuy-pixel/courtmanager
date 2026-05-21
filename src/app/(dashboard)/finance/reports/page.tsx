import { getCurrentAcademyId } from '@/lib/server-utils';
import { FinanceService } from '@/lib/services/finance.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FinanceCharts from '@/components/finance/FinanceCharts';

export default async function FinanceReportsPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const financeService = new FinanceService(academyId);
  
  const [
    { data: monthlyStats },
    { data: packageStats },
    { data: summary }
  ] = await Promise.all([
    financeService.getMonthlyRevenueStats(),
    financeService.getRevenueByPackageStats(),
    financeService.getFinanceSummary()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/finance" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 transition-all">
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo Tài chính</h1>
          <p className="text-white/50 mt-1">Phân tích chuyên sâu về doanh thu và cơ cấu kinh doanh.</p>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Tổng doanh thu</p>
          <p className="text-2xl font-mono text-white">{new Intl.NumberFormat('vi-VN').format(summary?.totalRevenue || 0)}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">TB mỗi tháng</p>
          <p className="text-2xl font-mono text-white">
            {new Intl.NumberFormat('vi-VN').format((summary?.totalRevenue || 0) / 6)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Gói bán chạy nhất</p>
          <p className="text-2xl font-bold text-purple-500 truncate">{packageStats?.[0]?.name || 'N/A'}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] p-6">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Tỷ lệ công nợ</p>
          <p className="text-2xl font-mono text-red-500">{summary?.overdueCount || 0} Ca</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <FinanceCharts 
        monthlyData={monthlyStats || []} 
        packageData={packageStats || []} 
      />

      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-white/40 text-sm mb-4">Bạn cần một báo cáo chi tiết hơn để trình bày?</p>
        <button className="rounded-xl bg-white/5 px-6 py-3 text-sm font-bold hover:bg-white/10 transition-all border border-white/10">
          Tải báo cáo chi tiết (CSV)
        </button>
      </div>
    </div>
  );
}
