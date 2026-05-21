import { getCurrentAcademyId } from '@/lib/server-utils';
import { FinanceService } from '@/lib/services/finance.service';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TuitionPackagesPage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) redirect('/dang-nhap');

  const financeService = new FinanceService(academyId);
  const { data: packages } = await financeService.getTuitionPackages();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/finance" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 transition-all">
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gói học phí</h1>
          <p className="text-white/50 mt-1">Quản lý danh mục các gói phí dịch vụ của học viện.</p>
        </div>
        <button className="ml-auto rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500">
          + Thêm gói mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <div key={pkg.id} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#0f0f0f] p-8 transition-all hover:border-purple-500/30 hover:bg-[#141414]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-600/5 blur-2xl group-hover:bg-purple-500/10 transition-all" />
            
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-500 uppercase">Hoạt động</span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-bold text-white">
                  {new Intl.NumberFormat('vi-VN').format(pkg.price)}
                </span>
                <span className="text-xs text-white/40 font-bold uppercase">VNĐ</span>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Số buổi học</span>
                  <span className="font-bold">{pkg.sessions_count || 'Không giới hạn'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Thời hạn</span>
                  <span className="font-bold">{pkg.duration_days ? `${pkg.duration_days} ngày` : 'Vĩnh viễn'}</span>
                </div>
              </div>

              <button className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold transition-all hover:bg-white/10">
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}

        {(!packages || packages.length === 0) && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-20 text-center">
            <p className="text-white/30 italic">Chưa có gói học phí nào được tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
