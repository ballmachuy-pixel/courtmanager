'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Users, Briefcase, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { getStudentReportData, getCoachReportData } from '@/app/actions/reports';
import { exportToExcel } from '@/lib/export-utils';

const YEARS = [2024, 2025, 2026];
const MONTHS = [
  { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' }, { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' }, { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' }, { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' }, { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' },
];

export default function ReportCenterClient() {
  // Default range: From 1st of current month to today
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleExportStudentReport = async () => {
    setLoading('student');
    setStatus(null);
    try {
      const data = await getStudentReportData(startDate, endDate);
      if (data.length === 0) {
        setStatus('Không có dữ liệu học viên trong khoảng thời gian này.');
        return;
      }
      exportToExcel(data, `Bao_cao_Hoc_vien_${startDate}_den_${endDate}`, 'HocVien');
    } catch (error) {
      console.error(error);
      setStatus('Lỗi khi tải dữ liệu báo cáo.');
    } finally {
      setLoading(null);
    }
  };

  const handleExportCoachReport = async () => {
    setLoading('coach');
    setStatus(null);
    try {
      const data = await getCoachReportData(startDate, endDate);
      if (data.length === 0) {
        setStatus('Không có dữ liệu check-in trong khoảng thời gian này.');
        return;
      }
      exportToExcel(data, `Bao_cao_Giao_vien_${startDate}_den_${endDate}`, 'GiaoVien');
    } catch (error) {
      console.error(error);
      setStatus('Lỗi khi tải dữ liệu báo cáo.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Trung Tâm Báo Cáo <span className="text-pink-500">v2.0</span></h1>
          <p className="text-slate-400 font-medium tracking-tight text-sm">Xuất dữ liệu Excel chuyên sâu & Theo dõi tái phí</p>
        </div>
      </div>

      {/* Time Selector */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40">
        <div className="bg-slate-950/50 rounded-[1.35rem] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-black text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Calendar size={16} className="text-white" />
              </div>
              Lọc theo khoảng ngày
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Từ ngày</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 transition-all text-sm font-bold [color-scheme:dark]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block ml-1">Đến ngày</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 transition-all text-sm font-bold [color-scheme:dark]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {status && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 mt-4 animate-pulse">
              <AlertCircle size={16} className="shrink-0" /> {status}
            </div>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-3xl p-1 shadow-xl shadow-black/40 transition-all group h-full">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 flex flex-col h-full">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Báo cáo Học viên</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Tổng hợp số buổi đi học, vắng mặt & tái phí.
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              onClick={handleExportStudentReport}
              disabled={!!loading}
            >
              {loading === 'student' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Tải Excel
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 rounded-3xl p-1 shadow-xl shadow-black/40 transition-all group h-full">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 flex flex-col h-full">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">Bảng công HLV</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Chi tiết lịch sử Check-in & GPS.
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              onClick={handleExportCoachReport}
              disabled={!!loading}
            >
              {loading === 'coach' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Tải Excel
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-slate-900/30 border border-white/5 border-dashed rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-slate-500 text-[10px] leading-relaxed">
          File xuất ra có định dạng <code className="text-pink-400">.xlsx</code>. Tương thích với Microsoft Excel, Google Sheets.
        </p>
      </div>
    </div>
  );
}

