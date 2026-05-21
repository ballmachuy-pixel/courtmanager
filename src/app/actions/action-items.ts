'use server';

import { ActionItemService } from '@/lib/services/action-item.service';
import { BaseService } from '@/lib/services/base.service';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function getPendingActionItemsAction() {
  const academyId = await BaseService.resolveAcademyId();
  if (!academyId) return { data: null, error: 'Unauthorized' };

  const service = new ActionItemService(academyId);
  const result = await service.getPendingItems();
  
  // Convert ServiceResult to plain object that can be passed to Client Components
  if (result.error) {
    return { data: null, error: result.error.message };
  }
  
  return { data: result.data, error: null };
}

export async function resolveActionItemAction(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Unauthorized' };

  const academyId = await BaseService.resolveAcademyId();
  if (!academyId) return { data: null, error: 'Unauthorized' };

  const service = new ActionItemService(academyId);
  const result = await service.resolveItem(itemId, user.id);
  
  if (!result.error) {
    revalidatePath('/dashboard');
    return { data: true, error: null };
  }
  
  return { data: null, error: result.error.message };
}
