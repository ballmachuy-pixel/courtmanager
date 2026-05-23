import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { getLeads } from '@/app/actions/crm';
import { ClassService } from '@/lib/services/class.service';
import KanbanBoard from '@/components/crm/KanbanBoard';

export default async function CrmPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const classService = new ClassService(academyId);

  // Fetch leads and schedules
  const [leads, schedules] = await Promise.all([
    getLeads(),
    classService.getSchedules()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng (CRM)</h1>
        <p className="text-white/50 mt-1">Theo dõi phễu học thử, chăm sóc phụ huynh và chuyển đổi thành học viên.</p>
      </div>

      <KanbanBoard initialLeads={leads} schedules={schedules || []} />
    </div>
  );
}
