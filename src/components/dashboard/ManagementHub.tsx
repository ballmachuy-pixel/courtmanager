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
}

export default function ManagementHub({
  todayScheduleCount,
  invalidCheckinsCount,
  totalAttendanceToday,
  studentCount,
  overduePaymentCount,
  classCount,
}: ManagementHubProps) {
  return (
    <div className="mb-10 animate-in" style={{ animationDelay: '100ms' }}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Zap size={13} className="text-indigo-400" />
        </div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Trung Tâm Điều Hành
        </h3>
      </div>

      {/* 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

        {/* ─── CỘT 1: VẬN HÀNH (HÀNH ĐỘNG) ─── */}
        <HubFolder
          title="Vận Hành"
          icon={Zap}
          iconColor="text-emerald-400"
          accentGradient="from-emerald-500/10 to-transparent"
        >
          <HubAction
            href="/attendance"
            icon={ClipboardCheck}
            label="Chốt Điểm Danh Nhanh"
            description="Báo cáo sỉ số lớp học trong ngày"
            badge={totalAttendanceToday > 0 ? `${totalAttendanceToday} HS` : undefined}
            badgeVariant="success"
            accentColor="emerald"
          />
          <HubAction
            href="/classes"
            icon={Zap}
            label="Phân Công Lịch Dạy"
            description="Lên thời khóa biểu cho Cán bộ"
            badge={todayScheduleCount > 0 ? `${todayScheduleCount} ca` : undefined}
            accentColor="cyan"
          />
          <HubAction
            href="/staff"
            icon={ShieldAlert}
            label="Xử Lý Cảnh Báo Check-in"
            description="Duyệt sai phạm đi muộn của HLV"
            badge={invalidCheckinsCount > 0 ? invalidCheckinsCount : undefined}
            badgeVariant={invalidCheckinsCount > 0 ? 'danger' : 'default'}
            accentColor="red"
          />
          <HubAction
            href="/analytics"
            icon={Users}
            label="Cảnh Báo Vắng Mặt"
            description="Danh sách học viên rủi ro cao"
            accentColor="rose"
          />
        </HubFolder>

        {/* ─── CỘT 2: HỒ SƠ (DỮ LIỆU & BÁO CÁO) ─── */}
        <HubFolder
          title="Hồ Sơ"
          icon={FileText}
          iconColor="text-blue-400"
          accentGradient="from-blue-500/10 to-transparent"
        >
          <HubAction
            href="/students"
            icon={Users}
            label="Danh Sách Học Viên"
            description="Quản lý thông tin và hồ sơ HS"
            badge={studentCount > 0 ? `${studentCount} HS` : undefined}
            accentColor="blue"
          />
          <HubAction
            href="/staff"
            icon={Shield}
            label="Danh Sách Nhân Sự"
            description="Quản lý tài khoản & phân quyền HLV"
            accentColor="indigo"
          />
          <HubAction
            href="/settings"
            icon={Settings}
            label="Thiết Lập Vị Trí (GPS)"
            description="Cấu hình tọa độ sân tập"
            accentColor="slate"
          />
          <HubAction
            href="/reports"
            icon={FileText}
            label="Xuất File Báo Cáo"
            description="Lưu trữ số liệu toàn trung tâm"
            accentColor="purple"
          />
        </HubFolder>

      </div>
    </div>
  );
}

