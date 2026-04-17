'use client';

import {
  ClipboardCheck, GraduationCap, Shield, ShieldAlert,
  Users, FileText, UserPlus,
  BarChart3, CreditCard,
  Bell, Settings, Zap,
} from 'lucide-react';
import HubFolder from './HubFolder';
import HubAction from './HubAction';

interface ManagementHubProps {
  // Vận hành
  todayScheduleCount: number;
  invalidCheckinsCount: number;
  totalAttendanceToday: number;
  // Học viên
  studentCount: number;
  // Tài chính
  overduePaymentCount: number;
  // Hệ thống
  classCount: number;
  // [MỚI] Các chỉ số v2.0
  activeSessionsCount: number;
  unmarkedSessionsCount: number;
}

export default function ManagementHub({
  todayScheduleCount,
  invalidCheckinsCount,
  totalAttendanceToday,
  studentCount,
  overduePaymentCount,
  classCount,
  activeSessionsCount,
  unmarkedSessionsCount,
}: ManagementHubProps) {
  return (
    <div className="mb-10 animate-in" style={{ animationDelay: '100ms' }}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center shadow-lg shadow-indigo-500/5">
          <Zap size={16} className="text-indigo-400" />
        </div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Trung Tâm Điều Hành (Banking Style)
        </h3>
      </div>

      {/* Grid of Square Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <HubAction
          href="/attendance"
          icon={ClipboardCheck}
          label="Chốt Điểm Danh"
          variant="tile"
          showNotificationDot={unmarkedSessionsCount > 0}
          badge={activeSessionsCount > 0 ? `${activeSessionsCount}/${todayScheduleCount} ca` : undefined}
          badgeVariant={unmarkedSessionsCount > 0 ? 'warning' : 'success'}
          accentColor="emerald"
        />
        
        <HubAction
          href="/classes"
          icon={Zap}
          label="Lịch Dạy"
          variant="tile"
          accentColor="cyan"
          badge={todayScheduleCount > 0 ? `${todayScheduleCount} ca` : undefined}
        />

        <HubAction
          href="/students"
          icon={Users}
          label="Học Viên"
          variant="tile"
          accentColor="blue"
          badge={studentCount}
        />

        <HubAction
          href="/reports"
          icon={FileText}
          label="Báo Cáo"
          variant="tile"
          accentColor="purple"
        />

        <HubAction
          href="/staff"
          icon={ShieldAlert}
          label="Cảnh Báo GPS"
          variant="tile"
          badge={invalidCheckinsCount > 0 ? invalidCheckinsCount : undefined}
          badgeVariant="danger"
          accentColor="red"
        />

        <HubAction
          href="/reports" 
          icon={CreditCard}
          label="Học Phí (Renewal)"
          variant="tile"
          badge={overduePaymentCount > 0 ? overduePaymentCount : undefined}
          badgeVariant="danger"
          accentColor="pink"
        />

        <HubAction
          href="/staff"
          icon={Shield}
          label="Nhân Sự"
          variant="tile"
          accentColor="indigo"
        />

        <HubAction
          href="/settings"
          icon={Settings}
          label="Cài Đặt GPS"
          variant="tile"
          accentColor="slate"
        />
      </div>
    </div>
  );
}

