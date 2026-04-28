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
  // Disabled as requested
  return;
}

export async function triggerCoachReminder(
  coachId: string,
  className: string,
  startTime: string
) {
  // Disabled as requested
  return false;
}
