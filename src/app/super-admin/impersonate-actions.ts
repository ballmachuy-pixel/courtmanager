'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { verifySuperAdminAction } from '@/lib/auth/impersonation';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function impersonateAcademy(academyId: string) {
  const { user, error } = await verifySuperAdminAction();
  
  if (error || !user) {
    throw new Error(error || 'Unauthorized');
  }

  const adminClient = createAdminClient();

  // 1. Kiểm tra xem Super Admin đã là thành viên của Academy này chưa
  const { data: member } = await adminClient
    .from('academy_members')
    .select('id')
    .eq('academy_id', academyId)
    .eq('user_id', user.id)
    .maybeSingle();

  // 2. Nếu chưa là thành viên, tự động bơm quyền Admin vào Academy đó (bypass RLS)
  if (!member) {
    await adminClient
      .from('academy_members')
      .insert({
        academy_id: academyId,
        user_id: user.id,
        role: 'admin',
      });
  }

  // 3. Set cookie để Dashboard nhận diện Academy hiện tại
  const cookieStore = await cookies();
  cookieStore.set('cm_selected_academy', academyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // 4. Redirect về Dashboard
  redirect('/dashboard');
}
