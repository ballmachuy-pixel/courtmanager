'use server';

import { requireAdminAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { AcademyService } from '@/lib/services/academy.service';
import { AssetService } from '@/lib/services/asset.service';

/**
 * Cập nhật thông tin cơ bản và Logo của học viện.
 */
export async function updateAcademyProfileAction(formData: FormData) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const academyService = new AcademyService(academyId);
  const assetService = new AssetService(academyId);

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const latitudeStr = formData.get('latitude') as string;
  const longitudeStr = formData.get('longitude') as string;
  const radiusStr = formData.get('radius') as string;

  try {
    let logoUrl = formData.get('current_logo_url') as string || null;
    
    // 1. Xử lý upload Logo mới nếu có
    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      const fileName = `settings/logo-${Date.now()}.jpg`;
      const { publicUrl, error: uploadError } = await assetService.uploadImage('branding', fileName, logoFile);
      if (uploadError) throw uploadError;
      logoUrl = publicUrl;
    }

    // 2. Cập nhật Profile
    const { error: updateError } = await academyService.updateProfile({
      name,
      slug,
      logo_url: logoUrl,
      latitude: latitudeStr ? parseFloat(latitudeStr) : null,
      longitude: longitudeStr ? parseFloat(longitudeStr) : null,
      allowed_radius_m: radiusStr ? parseInt(radiusStr, 10) : null
    });

    if (updateError) throw updateError;

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('[AcademyAction] Update failed:', error);
    return { error: error.message || 'Không thể cập nhật thông tin học viện' };
  }
}
/**
 * Cập nhật tọa độ Geofencing của học viện.
 */
export async function updateAcademyLocation(formData: FormData) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const academyService = new AcademyService(academyId);
  const lat = formData.get('latitude') as string;
  const lng = formData.get('longitude') as string;
  const radius = formData.get('radius') as string;

  try {
    const { error } = await academyService.updateProfile({
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      allowed_radius_m: radius ? parseInt(radius, 10) : null
    });

    if (error) throw error;
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Không thể cập nhật tọa độ' };
  }
}
