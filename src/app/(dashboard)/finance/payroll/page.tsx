import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { getPayrolls } from '@/app/actions/payroll';
import PayrollClient from '@/components/finance/PayrollClient';

export default async function PayrollPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  // Load current month's data by default
  const payrolls = await getPayrolls(currentMonth, currentYear);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tính Lương Tự Động (V2)</h1>
        <p className="text-white/50 mt-1">Hệ thống chốt công và sinh Phiếu lương chi tiết (Payroll Items) cho từng HLV.</p>
      </div>

      <PayrollClient 
        initialPayrolls={payrolls} 
        initialMonth={currentMonth} 
        initialYear={currentYear} 
      />
    </div>
  );
}
