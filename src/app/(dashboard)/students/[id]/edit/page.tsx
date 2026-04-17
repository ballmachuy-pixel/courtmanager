import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { EditStudentForm } from './edit-form';

export default async function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      *,
      parents(id, full_name, phone, access_token)
    `)
    .eq('id', params.id)
    .eq('academy_id', academyId)
    .single();

  if (error || !student) {
    return redirect('/students');
  }

  const initialData = {
    ...student,
    parent: student.parents || null
  };

  return <EditStudentForm studentId={params.id} initialData={initialData} />;
}
