import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { calculateMonthlyPayroll } from '@/app/actions/payroll';
import PayrollClient from '@/components/finance/PayrollClient';

export default async function PayrollPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  // Load current month's data by default
  const initialData = await calculateMonthlyPayroll(currentMonth, currentYear);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tính Lương Tự Động</h1>
        <p className="text-white/50 mt-1">Hệ thống tự động chốt công HLV dựa trên lịch sử Check-in GPS thực tế.</p>
      </div>

      <PayrollClient 
        initialData={initialData} 
        initialMonth={currentMonth} 
        initialYear={currentYear} 
      />
    </div>
  );
}
