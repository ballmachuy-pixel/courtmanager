'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updateAcademyLocation(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const lat = parseFloat(formData.get('latitude') as string);
  const lng = parseFloat(formData.get('longitude') as string);
  const radius = parseInt(formData.get('radius') as string) || 300;

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Tọa độ không hợp lệ');
  }

  const { error } = await supabase
    .from('academies')
    .update({
      latitude: lat,
      longitude: lng,
      allowed_radius_m: radius
    })
    .eq('id', academyId);

  if (error) {
    console.error('Update academy location error:', error);
    throw new Error(error.message || 'Không thể cập nhật vị trí trung tâm');
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/coach');
  
  return { success: true };
}

export async function switchAcademy(academyId: string) {
  const cookieStore = await cookies();
  
  // Lưu academyId mong muốn vào cookie để server-utils đọc
  cookieStore.set('cm_selected_academy', academyId, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Revalidate toàn bộ để app tải lại dữ liệu với AcademyId mới
  revalidatePath('/', 'layout');
  
  return { success: true };
}
