import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SKILL_LABELS } from '@/lib/utils';
import ClassDetailClient from '@/components/classes/ClassDetailClient';

export default async function ClassDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const [{ data: clazz }, { data: allStudents }, { data: allCoaches }, { data: defaultCoaches }] = await Promise.all([
    supabase
      .from('classes')
      .select(`
        *,
        head_coach:academy_members!head_coach_id(display_name),
        student_classes(
          id,
          students(id, full_name, skill_level, is_active)
        ),
        schedules(*, schedule_coaches(coach_id))
      `)
      .eq('id', params.id)
      .eq('academy_id', academyId)
      .single(),
    supabase
      .from('students')
      .select('id, full_name, skill_level')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .order('full_name'),
    supabase
      .from('academy_members')
      .select('id, display_name')
      .eq('academy_id', academyId)
      .in('role', ['coach', 'admin', 'owner'])
      .eq('is_active', true)
      .order('display_name'),
    supabase
      .from('class_default_coaches')
      .select('coach_id')
      .eq('class_id', params.id)
  ]);

  if (!clazz) {
    return (
      <div className="empty-state">
        <h3 style={{ fontSize: 'var(--text-lg)' }}>Không tìm thấy lớp học</h3>
        <p className="text-muted">Lớp học không tồn tại hoặc đã bị xóa.</p>
        <Link href="/classes" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const defaultCoachIds = defaultCoaches?.map(dc => dc.coach_id) || [];

  return (
    <ClassDetailClient 
      clazz={clazz} 
      allStudents={allStudents || []} 
      allCoaches={allCoaches || []} 
      defaultCoachIds={defaultCoachIds}
    />
  );
}
