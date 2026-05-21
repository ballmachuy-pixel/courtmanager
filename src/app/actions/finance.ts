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
  const amount = parseFloat(formData.get('amount') as string);
  const paymentDate = formData.get('paymentDate') as string;
  const paymentMethod = formData.get('paymentMethod') as 'cash' | 'transfer' | 'other';
  const description = formData.get('description') as string;

  if (!studentId || isNaN(amount) || !paymentDate) {
    return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
  }

  try {
    const { error } = await financeService.recordPayment({
      student_id: studentId,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      description,
      status: 'completed'
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
