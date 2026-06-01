'use server';

import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { FinanceService, PaymentRecord } from '@/lib/services/finance.service';

/**
 * Ghi nhận một phiếu thu mới cho học viên.
 */
export async function recordPaymentAction(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const financeService = new FinanceService(academyId);

  const studentId = formData.get('studentId') as string;
  const packageId = formData.get('packageId') as string | null;
  const amount = parseFloat(formData.get('amount') as string) || 0;
  const totalAmount = parseFloat(formData.get('totalAmount') as string) || amount;
  const debtAmount = parseFloat(formData.get('debtAmount') as string) || 0;
  const paymentDate = formData.get('paymentDate') as string;
  const paymentMethod = formData.get('paymentMethod') as 'cash' | 'transfer' | 'other';
  const description = formData.get('description') as string;

  if (!studentId || !paymentDate) {
    return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
  }

  if (amount < 0 || totalAmount < 0 || debtAmount < 0) {
    return { error: 'Số tiền không được là số âm' };
  }

  const status = debtAmount > 0 ? 'partial' : 'completed';

  try {
    const { error } = await financeService.recordPayment({
      student_id: studentId,
      package_id: packageId || null,
      total_amount: totalAmount,
      amount,
      debt_amount: debtAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      description,
      status
    });

    if (error) throw error;

    revalidatePath('/finance');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('[FinanceAction] Error:', error);
    return { error: 'Không thể ghi nhận phiếu thu' };
  }
}
