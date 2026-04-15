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

export default function ReportCenterPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleExportStudentReport = async () => {
    setLoading('student');
    setStatus(null);
    try {
      const data = await getStudentReportData(selectedMonth, selectedYear);
      if (data.length === 0) {
        setStatus('Không có dữ liệu học viên trong tháng này.');
        return;
      }
      exportToExcel(data, `Bao_cao_Hoc_vien_T${selectedMonth}_${selectedYear}`, 'HocVien');
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
      const data = await getCoachReportData(selectedMonth, selectedYear);
      if (data.length === 0) {
        setStatus('Không có dữ liệu check-in của giáo viên trong tháng này.');
        return;
      }
      exportToExcel(data, `Bao_cao_Giao_vien_T${selectedMonth}_${selectedYear}`, 'GiaoVien');
    } catch (error) {
      console.error(error);
      setStatus('Lỗi khi tải dữ liệu báo cáo.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="animate-in flex flex-col gap-6 md:gap-8 pb-20">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Trung Tâm Báo Cáo</h1>
          <p className="text-slate-400 font-medium">Xuất dữ liệu Excel để theo dõi điểm danh và check-in nhân sự</p>
        </div>
      </div>

      {/* Time Selector */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl shadow-black/40 max-w-2xl">
        <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8">
          <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Calendar size={20} className="text-white" />
            </div>
            Chọn thời gian báo cáo
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Tháng</label>
              <select
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value} className="bg-slate-900 text-white">{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Năm</label>
              <select
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm font-medium"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map(y => (
                  <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>
                ))}
              </select>
            </div>
          </div>

          {status && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 mt-4">
              <AlertCircle size={16} className="shrink-0" /> {status}
            </div>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Report */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-3xl p-1 shadow-xl shadow-black/40 transition-all group">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8 flex flex-col h-full">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6 group-hover:scale-110 transition-transform">
                <Users size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">Báo cáo Học viên & Điểm danh</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Tổng hợp số buổi đi học, đi muộn, vắng mặt của từng học viên trong tháng.
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/25 hover:shadow-emerald-500/40 active:scale-95 disabled:opacity-50"
              onClick={handleExportStudentReport}
              disabled={!!loading}
            >
              {loading === 'student' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Tải về Báo cáo Học viên
            </button>
          </div>
        </div>

        {/* Coach Report */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 rounded-3xl p-1 shadow-xl shadow-black/40 transition-all group">
          <div className="bg-slate-950/50 rounded-[1.35rem] p-6 md:p-8 flex flex-col h-full">
            <div className="flex-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-6 group-hover:scale-110 transition-transform">
                <Briefcase size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">Bảng công Giáo viên (GPS)</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Chi tiết lịch sử Check-in của HLV, hiển thị khoảng cách so với sân và cảnh báo GPS.
              </p>
            </div>
            <button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50"
              onClick={handleExportCoachReport}
              disabled={!!loading}
            >
              {loading === 'coach' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Tải về Bảng công HLV
            </button>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-slate-900/30 border border-white/5 border-dashed rounded-2xl p-5 flex items-start gap-4">
        <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Lưu ý định dạng</h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            File xuất ra có định dạng <code className="text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">.xlsx</code>. Bạn có thể mở bằng Microsoft Excel, Google Sheets hoặc Numbers. Các cột số được để ở dạng số trơn để bạn có thể tự lập công thức.
          </p>
        </div>
      </div>
    </div>
  );
}
