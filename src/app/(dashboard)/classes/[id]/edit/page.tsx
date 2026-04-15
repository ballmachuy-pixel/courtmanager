import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import ClassEditForm from './edit-form';

export default async function EditClassPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const [{ data: clazz }, { data: coaches }] = await Promise.all([
    supabase
      .from('classes')
      .select('*')
      .eq('id', params.id)
      .eq('academy_id', academyId)
      .single(),
    supabase
      .from('academy_members')
      .select('id, display_name, role')
      .eq('academy_id', academyId)
      .in('role', ['coach', 'admin', 'owner'])
      .neq('is_active', false)
      .order('display_name')
  ]);

  if (!clazz) {
    return redirect('/classes');
  }

  return <ClassEditForm clazz={clazz} coaches={coaches || []} />;
}
