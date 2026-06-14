'use server';

import { requireAdminAcademyId } from '@/lib/server-utils';
import { AcademyService } from '@/lib/services/academy.service';
import { revalidatePath } from 'next/cache';
import { AcademyLocation } from '@/types/database';

export async function upsertLocationAction(location: Partial<AcademyLocation>) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const service = new AcademyService(academyId);
  const { error } = await service.upsertLocation(location);

  if (error) throw error;
  
  revalidatePath('/settings');
  return { success: true };
}

export async function deleteLocationAction(locationId: string) {
  const academyId = await requireAdminAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const service = new AcademyService(academyId);
  const { error } = await service.deleteLocation(locationId);

  if (error) throw error;
  
  revalidatePath('/settings');
  return { success: true };
}
