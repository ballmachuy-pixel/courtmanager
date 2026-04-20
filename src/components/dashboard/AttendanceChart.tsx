'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

interface ChartData {
  date: string;
  present: number;
  absent: number;
}

interface AttendanceChartProps {
  data: ChartData[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="glass-card p-6 md:p-8 flex flex-col h-[400px] relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5">
              <TrendingUp size={20} />
            </div>
            Xu hướng chuyên cần
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-medium ml-13">Thống kê 7 ngày gần nhất</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3">
            <div className="w-2 H-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Có mặt</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="flex items-center gap-2 px-3">
            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vắng</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.03)" 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 800 }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="present"
              name="Có mặt"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPresent)"
              animationDuration={1500}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
            <Area
              type="monotone"
              dataKey="absent"
              name="Vắng mặt"
              stroke="#475569"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
