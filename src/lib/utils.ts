// ========================================
// Sunday - Sunset Academy — Utility Functions
// ========================================

/**
 * Format Vietnamese currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date to relative time (e.g., "2 giờ trước")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(date);
}

/**
 * Format time (HH:mm)
 */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Get day of week in Vietnamese
 */
const DAY_NAMES_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES_VI[dayOfWeek] || '';
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get initials from full name (for avatar)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}


/**
 * Classnames helper (simple version)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Attendance status labels in Vietnamese
 */
export const ATTENDANCE_LABELS: Record<string, string> = {
  present: 'Có mặt',
  absent: 'Vắng',
  late: 'Muộn',
  excused: 'Có phép',
};

/**
 * Payment status labels in Vietnamese
 */
export const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Chờ đóng',
  paid: 'Đã đóng',
  overdue: 'Quá hạn',
};

/**
 * Skill level labels in Vietnamese
 */
export const SKILL_LABELS: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

/**
 * Billing cycle labels in Vietnamese
 */
export const BILLING_LABELS: Record<string, string> = {
  monthly: 'Theo tháng',
  per_session: 'Theo buổi',
  per_course: 'Theo khóa',
};

/**
 * Relationship labels in Vietnamese
 */
export const RELATIONSHIP_LABELS: Record<string, string> = {
  father: 'Bố',
  mother: 'Mẹ',
  grandfather: 'Ông',
  grandmother: 'Bà',
  guardian: 'Người giám hộ',
};

// ========================================
// Timezone Helpers for ICT (Asia/Ho_Chi_Minh)
// ========================================

/**
 * Returns today's date in YYYY-MM-DD strictly mapped to Vietnam Timezone
 */
export function getICTDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

/**
 * Returns a UTC Date object that perfectly equals 00:00:00 AM of TODAY in Vietnam
 * Used for querying Database timestamps (created_at >= startOfDay)
 */
export function getICTStartOfDayUTC(): Date {
  const now = new Date();
  const ictOffsetMillis = 7 * 60 * 60 * 1000;
  // What time is it locally in ICT assuming current UTC time
  const ictTime = new Date(now.getTime() + ictOffsetMillis);
  // Flatten down to midnight ICT
  const ictMidnight = new Date(ictTime);
  ictMidnight.setUTCHours(0, 0, 0, 0);
  // Translate back to UTC for standard Database querying
  return new Date(ictMidnight.getTime() - ictOffsetMillis);
}

/**
 * Returns the correct Day Of Week (0-6) mapped to Vietnam Timezone regardless of Server UTC Time
 */
export function getDayOfWeekICT(): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short' }).formatToParts(new Date());
  const dayStr = parts.find(p => p.type === 'weekday')?.value;
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr || 'Sun'];
}

/**
 * Formats a UTC date string or Date object to Vietnam Time (HH:mm)
 */
export function formatICTTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

