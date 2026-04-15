'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

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
