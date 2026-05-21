'use server';

import { getCurrentAcademyId } from '@/lib/server-utils';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ProgressService } from '@/lib/services/progress.service';

/**
 * Ghi nhận một bản đánh giá kỹ năng mới.
 */
export async function recordAssessmentAction(input: any) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const userId = authUser?.user?.id;

  if (!userId) return { error: 'User not found' };

  const progressService = new ProgressService(academyId);

  try {
    const { error } = await progressService.recordAssessment({
      ...input,
      assessed_by: userId
    });

    if (error) throw error;

    revalidatePath(`/students/${input.student_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('[ProgressAction] Error:', error);
    return { error: 'Không thể lưu đánh giá kỹ năng' };
  }
}
