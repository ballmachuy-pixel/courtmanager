import { AcademyService } from '@/lib/services/super-admin/academy.service';
import CreateAcademyForm from '@/components/super-admin/CreateAcademyForm';
import WelcomeWizard from '@/components/onboarding/WelcomeWizard';
import ToggleAcademyStatus from '@/components/super-admin/ToggleAcademyStatus';
import ImpersonateAcademyBtn from '@/components/super-admin/ImpersonateAcademyBtn';
import { getICTDateString } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, MoonStar, HelpCircle } from 'lucide-react';

export default async function SuperAdminPage() {
  const academyService = new AcademyService();
  const [{ data: academies }, { data: stats }] = await Promise.all([
    academyService.getAllAcademies(),
    academyService.getSystemStats()
  ]);

  const getHealthStatus = (lastAttendance: string | null) => {
    if (!lastAttendance) return { label: 'Chưa có dữ liệu', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    
    const targetTime = new Date(lastAttendance).getTime();
    const currentTime = new Date().getTime();
    const diffHours = Math.floor((currentTime - targetTime) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return { label: 'Sống khỏe', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (diffDays <= 7) return { label: 'Cần chú ý', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'Ngủ đông', icon: MoonStar, color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const formatTimeAgo = (lastAttendance: string | null) => {
    if (!lastAttendance) return 'Chưa có';
    const targetTime = new Date(lastAttendance).getTime();
    const currentTime = new Date().getTime();
    const diffHours = Math.floor((currentTime - targetTime) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tháp Điều Khiển V3</h1>
          <p className="text-white/50 mt-1">Control Tower - Giám sát sức khỏe và quản trị rủi ro hệ thống.</p>
        </div>
        <CreateAcademyForm />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0f0f0f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Học viện</th>
                <th className="px-6 py-4 font-bold">Ngày tạo</th>
                <th className="px-6 py-4 font-bold">Sức khỏe</th>
                <th className="px-6 py-4 font-bold">Điểm danh gần nhất</th>
                <th className="px-6 py-4 font-bold">Access</th>
                <th className="px-6 py-4 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {academies?.map((academy) => {
                const health = getHealthStatus(academy.last_attendance_at);
                const HealthIcon = health.icon;
                const isActive = academy.access_status === 'active';

                return (
                  <tr key={academy.id} className={`transition-colors hover:bg-white/5 ${!isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
                          {academy.logo_url ? <img src={academy.logo_url} className="h-5 w-5 object-contain" /> : '🏀'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{academy.name}</p>
                          <p className="text-xs text-white/40">{academy.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {new Date(academy.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${health.bg} ${health.color}`}>
                        <HealthIcon size={12} />
                        {health.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70 font-mono">
                      {formatTimeAgo(academy.last_attendance_at)}
                    </td>
                    <td className="px-6 py-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ImpersonateAcademyBtn academyId={academy.id} />
                        <ToggleAcademyStatus 
                          academyId={academy.id} 
                          currentStatus={academy.access_status || 'active'} 
                          academyName={academy.name}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!academies || academies.length === 0) && (
            <div className="p-8">
              <WelcomeWizard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
