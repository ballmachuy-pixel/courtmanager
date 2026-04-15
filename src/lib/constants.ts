// ========================================
// App Constants
// ========================================

export const APP_NAME = 'Sunday - Sunset Academy';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SPORT_TYPES = [
  { value: 'basketball', label: '🏀 Bóng rổ' },
  { value: 'football', label: '⚽ Bóng đá' },
  { value: 'swimming', label: '🏊 Bơi lội' },
  { value: 'martial_arts', label: '🥋 Võ thuật' },
  { value: 'badminton', label: '🏸 Cầu lông' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'gymnastics', label: '🤸 Thể dục' },
  { value: 'other', label: '🏅 Khác' },
];

export const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Học viên', href: '/students', icon: 'Users' },
  { label: 'Lớp học', href: '/classes', icon: 'GraduationCap' },
  { label: 'Điểm danh', href: '/attendance', icon: 'ClipboardCheck' },
  { label: 'Nhân sự', href: '/staff', icon: 'Shield' },
  { label: 'Thống kê', href: '/analytics', icon: 'BarChart3' },
  { label: 'Báo cáo', href: '/reports', icon: 'FileText' },
  { label: 'Thông báo', href: '/announcements', icon: 'Bell' },
  { label: 'Cài đặt', href: '/settings', icon: 'Settings' },
];


export const AGE_GROUPS = [
  '5-7 tuổi',
  '8-10 tuổi',
  '11-13 tuổi',
  '14-16 tuổi',
  '17+ tuổi',
];
