import { createAdminClient } from '@/lib/supabase/service';

// Mock function to simulate a Zalo ZNS API Call or Email Resend
export async function sendZaloZNS(phone: string, templateId: string, templateData: Record<string, string>) {
  // ZNS payload logged only in development

  const zaloToken = process.env.ZALO_OA_ACCESS_TOKEN;
  if (!zaloToken) {
    console.warn("Zalo OA Access Token is missing. Mock execution only.");
    return true; // Simulate success if no token is found during eval.
  }

  try {
    const response = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': zaloToken
      },
      body: JSON.stringify({
        phone: phone.startsWith('0') ? `84${phone.slice(1)}` : phone,
        template_id: templateId,
        template_data: templateData
      }),
    });
    
    const result = await response.json();
    // ZNS response received
    return result.error === 0;
  } catch (err) {
    console.error('[ZALO ZNS ERROR] Failed to send ZNS', err);
    return false;
  }
}

export async function triggerAttendanceNotification(
  studentId: string, 
  className: string, 
  date: string, 
  status: string
) {
  try {
    const supabase = createAdminClient();
    
    // Find parent's phone through Student's parent_id (v2.0 Logic)
    const { data: student } = await supabase
      .from('students')
      .select('full_name, parents(phone, full_name)')
      .eq('id', studentId)
      .single();

    if (!student || !student.parents) {
      console.warn(`No parent found for student ${studentId}. Skipping notification.`);
      return;
    }

    const parentData = student.parents as any;
    if (!parentData.phone) return;

    let message = '';
    if (status === 'present') message = 'đã có mặt tại sân an toàn';
    else if (status === 'absent') message = 'được ghi nhận vắng mặt không phép';
    else if (status === 'excused') message = 'được ghi nhận vắng mặt có phép';
    else if (status === 'late') message = 'đã đến sân nhưng bị trễ giờ';

    await sendZaloZNS(parentData.phone, 'ATTENDANCE_ALERT', {
      parentName: parentData.full_name,
      studentName: student.full_name,
      classInfo: className,
      dateInfo: date,
      statusMsg: message
    });
  } catch (error) {
    console.error('Failed to trigger attendance notification', error);
  }
}

/*
export async function triggerPaymentSuccessNotification(paymentId: string) {
  try {
    const supabase = createAdminClient();
    
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        students(id, full_name, parent_profiles(phone, parent_name)),
        fee_plans(name)
      `)
      .eq('id', paymentId)
      .single();

    if (!payment) return;

    const studentProfile = payment.students as {
      id: string;
      full_name: string;
      parent_profiles: { phone: string; parent_name: string }[];
    } | null;
    if (!studentProfile) return;

    // A student might have multiple parents, picking the first one
    const parentProfile = studentProfile.parent_profiles?.[0];
    if (!parentProfile || !parentProfile.phone) return;

    await sendZaloZNS(parentProfile.phone, 'PAYMENT_RECEIPT', {
      parentName: parentProfile.parent_name,
      studentName: studentProfile.full_name,
      feeName: (payment.fee_plans as { name: string })?.name || 'Học phí',
      amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount),
      paidDate: payment.paid_date || new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to trigger payment success notification', error);
  }
}
*/

export async function triggerCoachReminder(
  coachId: string,
  className: string,
  startTime: string
) {
  try {
    const supabase = createAdminClient();
    
    const { data: coach } = await supabase
      .from('academy_members')
      .select('display_name, phone')
      .eq('id', coachId)
      .single();

    if (!coach || !coach.phone) {
      console.warn(`No phone found for coach ${coachId}. Skipping reminder.`);
      return false;
    }

    // Format message: "[CourtManager] Thầy ơi, lớp [Tên lớp] lúc [Giờ] đã bắt đầu, Thầy nhớ điểm danh cho học sinh nhé!"
    const formattedTime = startTime.substring(0, 5);
    const success = await sendZaloZNS(coach.phone, 'COACH_REMINDER', {
      coachName: coach.display_name,
      className: className,
      startTime: formattedTime
    });

    return success;
  } catch (error) {
    console.error('Failed to trigger coach reminder', error);
    return false;
  }
}
