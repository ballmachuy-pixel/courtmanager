'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { verifyCoachSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function createAnnouncement(formData: FormData) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Get current user id
  const cookieStore = await cookies();
  const token = cookieStore.get('coach_session')?.value;
  let createdBy = null;
  if (token) {
    const session = await verifyCoachSession(token);
    if (session) createdBy = session.member_id;
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const target = formData.get('target') as string || 'all';

  if (!title || !content) {
    throw new Error('Vui lòng điền đủ tiêu đề và nội dung');
  }

  const { error } = await supabase
    .from('announcements')
    .insert({
      academy_id: academyId,
      title,
      content,
      target,
      created_by: createdBy
    });

  revalidatePath('/announcements');
  return { success: true };
}
