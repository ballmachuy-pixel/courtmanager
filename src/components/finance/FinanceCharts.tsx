'use client';

interface MonthlyStats {
  month: string;
  revenue: number;
}

interface PackageStats {
  name: string;
  value: number;
}

interface FinanceChartsProps {
  monthlyData: MonthlyStats[];
  packageData: PackageStats[];
}

export default function FinanceCharts({ monthlyData, packageData }: FinanceChartsProps) {
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
  const totalRevenue = packageData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Doanh thu 6 tháng */}
      <div className="rounded-3xl border border-white/5 bg-[#0f0f0f] p-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">Doanh thu 6 tháng</h3>
        <div className="flex items-end justify-between h-48 gap-4">
          {monthlyData.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-4 group">
              <div className="relative w-full flex items-end justify-center h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap">
                  {new Intl.NumberFormat('vi-VN').format(d.revenue)}
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-purple-600/20 to-purple-500 transition-all duration-1000 ease-out group-hover:to-purple-400 group-hover:scale-x-110"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-white/30 group-hover:text-white/60 transition-colors uppercase">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cơ cấu Gói học phí */}
      <div className="rounded-3xl border border-white/5 bg-[#0f0f0f] p-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">Cơ cấu Gói học phí</h3>
        <div className="space-y-6">
          {packageData.map((p, i) => {
            const percent = totalRevenue > 0 ? (p.value / totalRevenue) * 100 : 0;
            return (
              <div key={p.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{p.name}</span>
                  <span className="text-white/40">{new Intl.NumberFormat('vi-VN').format(p.value)} VNĐ ({percent.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
          {packageData.length === 0 && (
            <div className="py-12 text-center text-white/20 italic text-sm">Chưa có dữ liệu theo gói.</div>
          )}
        </div>
      </div>
    </div>
  );
}
