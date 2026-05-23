'use client';

import { useState } from 'react';
import { updateLeadStatus, convertLeadToStudent } from '@/app/actions/crm';
import { UserPlus, Calendar, PhoneCall, CheckCircle2, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import AddLeadForm from './AddLeadForm';
import ScheduleTrialForm from './ScheduleTrialForm';

export default function KanbanBoard({ initialLeads, schedules }: { initialLeads: any[], schedules: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const columns = [
    { id: 'new', title: 'Khách mới', icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'scheduled', title: 'Đã xếp lịch học thử', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { id: 'trialed', title: 'Chờ kết quả / Chăm sóc', icon: PhoneCall, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'won', title: 'Thành công (Đã đăng ký)', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setIsProcessing(leadId);
    try {
      await updateLeadStatus(leadId, newStatus);
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConvert = async (leadId: string) => {
    if (!confirm('Xác nhận chuyển Khách hàng này thành Học viên chính thức?')) return;
    setIsProcessing(leadId);
    try {
      await convertLeadToStudent(leadId);
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'won' } : l));
      alert('Đã chuyển thành Học viên thành công!');
    } catch (err) {
      alert('Lỗi chuyển đổi học viên');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quy trình Chăm sóc</h2>
        <AddLeadForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="min-w-[280px] bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            {/* Column Header */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${col.bg} ${col.border}`}>
              <col.icon size={18} className={col.color} />
              <h3 className={`font-bold text-sm ${col.color}`}>{col.title}</h3>
              <span className="ml-auto bg-black/40 text-white/60 px-2 py-0.5 rounded-full text-xs font-mono">
                {leads.filter(l => l.status === col.id || (col.id === 'trialed' && l.status === 'follow_up')).length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {leads.filter(l => l.status === col.id || (col.id === 'trialed' && l.status === 'follow_up')).map(lead => {
                const latestTrial = lead.trial_requests?.[0];

                return (
                  <div key={lead.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white">{lead.student_name}</h4>
                      
                      {/* Action Menu Trigger - simplified as buttons for now */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {isProcessing === lead.id && <Loader2 size={14} className="animate-spin text-white/50" />}
                      </div>
                    </div>
                    
                    <p className="text-xs text-white/60 mb-1">
                      <span className="text-white/40">Phụ huynh:</span> {lead.parent_name || 'N/A'} - {lead.parent_phone}
                    </p>

                    {/* Show Trial Info if exists */}
                    {latestTrial && (
                      <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px]">
                        <p className="font-bold text-indigo-400">Lịch học thử: {formatDate(latestTrial.trial_date)}</p>
                        <p className="text-white/60 truncate">{latestTrial.schedules?.classes?.name}</p>
                        {latestTrial.coach_evaluation && (
                          <div className="mt-1 pt-1 border-t border-indigo-500/20">
                            <span className="text-indigo-300">Đánh giá: </span> 
                            {latestTrial.coach_evaluation === 'good' ? '🟢 Tốt' : latestTrial.coach_evaluation === 'average' ? '🟡 Khá' : '🔴 Cần cố gắng'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions based on column */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {col.id === 'new' && (
                        <ScheduleTrialForm leadId={lead.id} schedules={schedules} />
                      )}
                      
                      {col.id === 'scheduled' && (
                        <button 
                          onClick={() => handleStatusChange(lead.id, 'trialed')}
                          disabled={isProcessing === lead.id}
                          className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                        >
                          Xác nhận đã học
                        </button>
                      )}

                      {col.id === 'trialed' && (
                        <>
                          <button 
                            onClick={() => handleConvert(lead.id)}
                            disabled={isProcessing === lead.id}
                            className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 w-full mb-1"
                          >
                            Chốt đăng ký (WON)
                          </button>
                          <button 
                            onClick={() => handleStatusChange(lead.id, 'lost')}
                            disabled={isProcessing === lead.id}
                            className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 flex-1 text-center"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
