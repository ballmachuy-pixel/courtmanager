/**
 * ============================================================
 * [BMAD QA Team] — CourtManager Utility Functions Test Suite
 * Coverage: formatCurrency, formatDate, formatRelativeTime,
 *           formatTime, getDayName, calculateAge, getInitials,
 *           cn, getICTDateString, getICTStartOfDayUTC,
 *           getDayOfWeekICT
 * ============================================================
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatTime,
  getDayName,
  calculateAge,
  getInitials,
  cn,
  getICTDateString,
  getICTStartOfDayUTC,
  getDayOfWeekICT,
  ATTENDANCE_LABELS,
  SKILL_LABELS,
  RELATIONSHIP_LABELS,
} from '../src/lib/utils';

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────
// formatCurrency
// ─────────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formats a positive amount as VND', () => {
    const result = formatCurrency(150000);
    expect(result).toContain('150');
    expect(result).toContain('₫'); // Vietnamese dong symbol
  });

  it('formats a large amount using Vietnamese thousand separator (dots)', () => {
    const result = formatCurrency(1500000);
    // vi-VN locale uses "." as thousand separator (e.g., "1.500.000 ₫")
    expect(result).toContain('1.500.000');
    expect(result).toContain('₫');
  });
});

// ─────────────────────────────────────────────────────────────
// formatDate
// ─────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('formats a date string to DD/MM/YYYY', () => {
    const result = formatDate('2024-04-15');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toContain('2024');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toContain('2024');
  });
});

// ─────────────────────────────────────────────────────────────
// formatRelativeTime
// ─────────────────────────────────────────────────────────────
describe('formatRelativeTime', () => {
  it('returns "Vừa xong" for less than 1 minute ago', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('Vừa xong');
  });

  it('returns minutes ago for < 1 hour', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 phút trước');
  });

  it('returns hours ago for < 24 hours', () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 giờ trước');
  });

  it('returns days ago for < 7 days', () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 ngày trước');
  });

  it('returns formatted date for >= 7 days', () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(tenDaysAgo);
    // Should fall back to formatDate (DD/MM/YYYY)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

// ─────────────────────────────────────────────────────────────
// formatTime
// ─────────────────────────────────────────────────────────────
describe('formatTime', () => {
  it('returns the first 5 characters (HH:mm)', () => {
    expect(formatTime('08:30:00')).toBe('08:30');
    expect(formatTime('17:00:00')).toBe('17:00');
  });

  it('handles already trimmed time', () => {
    expect(formatTime('09:15')).toBe('09:15');
  });
});

// ─────────────────────────────────────────────────────────────
// getDayName
// ─────────────────────────────────────────────────────────────
describe('getDayName', () => {
  it('returns correct Vietnamese day names', () => {
    expect(getDayName(0)).toBe('Chủ nhật');
    expect(getDayName(1)).toBe('Thứ 2');
    expect(getDayName(2)).toBe('Thứ 3');
    expect(getDayName(3)).toBe('Thứ 4');
    expect(getDayName(4)).toBe('Thứ 5');
    expect(getDayName(5)).toBe('Thứ 6');
    expect(getDayName(6)).toBe('Thứ 7');
  });

  it('returns empty string for invalid day', () => {
    expect(getDayName(7)).toBe('');
    expect(getDayName(-1)).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────
// calculateAge
// ─────────────────────────────────────────────────────────────
describe('calculateAge', () => {
  it('calculates correct age', () => {
    // A person born exactly 10 years ago
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const dob = tenYearsAgo.toISOString().split('T')[0];
    expect(calculateAge(dob)).toBe(10);
  });

  it('returns 0 for a newborn today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateAge(today)).toBe(0);
  });

  it('correctly subtracts one year when birthday has not occurred yet this year', () => {
    const today = new Date();
    // Born in a future month this year (birthday hasn't happened yet)
    // Use a month that is guaranteed to be in the future vs today's month
    const futureMonth = (today.getMonth() + 1) % 12; // next month (wraps to Jan if Dec)
    const yearOffset = futureMonth <= today.getMonth() ? 4 : 5; // compensate for year wrap
    const dob = new Date(today.getFullYear() - yearOffset, futureMonth, 15);
    const age = calculateAge(dob.toISOString().split('T')[0]);
    // Age should be yearOffset - 1 since birthday hasn't happened yet
    expect(age).toBe(yearOffset - 1);
  });
});

// ─────────────────────────────────────────────────────────────
// getInitials
// ─────────────────────────────────────────────────────────────
describe('getInitials', () => {
  it('returns first letter of single name', () => {
    expect(getInitials('Hưng')).toBe('H');
  });

  it('returns first + last initials for full name', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA');
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles extra spaces', () => {
    expect(getInitials('  Lê  Bảo  ')).toBe('LB');
  });

  it('returns uppercase', () => {
    expect(getInitials('nam anh')).toBe('NA');
  });
});

// ─────────────────────────────────────────────────────────────
// cn (classnames helper)
// ─────────────────────────────────────────────────────────────
describe('cn', () => {
  it('joins truthy class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
  });

  it('returns empty string for all falsy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });

  it('handles single class', () => {
    expect(cn('btn-primary')).toBe('btn-primary');
  });
});

// ─────────────────────────────────────────────────────────────
// getICTDateString
// ─────────────────────────────────────────────────────────────
describe('getICTDateString', () => {
  it('returns a valid YYYY-MM-DD string', () => {
    const result = getICTDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns today\'s date in YYYY-MM-DD', () => {
    const result = getICTDateString();
    const [year, month, day] = result.split('-').map(Number);
    expect(year).toBeGreaterThan(2020);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

// ─────────────────────────────────────────────────────────────
// getICTStartOfDayUTC
// ─────────────────────────────────────────────────────────────
describe('getICTStartOfDayUTC', () => {
  it('returns a Date object', () => {
    const result = getICTStartOfDayUTC();
    expect(result).toBeInstanceOf(Date);
  });

  it('the returned UTC time should be 17:00 of previous day (UTC+7 midnight = UTC 17:00)', () => {
    const result = getICTStartOfDayUTC();
    expect(result.getUTCHours()).toBe(17);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// getDayOfWeekICT
// ─────────────────────────────────────────────────────────────
describe('getDayOfWeekICT', () => {
  it('returns a number between 0 and 6', () => {
    const result = getDayOfWeekICT();
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(6);
  });
});

// ─────────────────────────────────────────────────────────────
// Constants / Label Maps
// ─────────────────────────────────────────────────────────────
describe('ATTENDANCE_LABELS', () => {
  it('has all required statuses', () => {
    expect(ATTENDANCE_LABELS['present']).toBe('Có mặt');
    expect(ATTENDANCE_LABELS['absent']).toBe('Vắng');
    expect(ATTENDANCE_LABELS['late']).toBe('Muộn');
    expect(ATTENDANCE_LABELS['excused']).toBe('Có phép');
  });
});

describe('SKILL_LABELS', () => {
  it('has all skill levels', () => {
    expect(SKILL_LABELS['beginner']).toBe('Cơ bản');
    expect(SKILL_LABELS['intermediate']).toBe('Trung bình');
    expect(SKILL_LABELS['advanced']).toBe('Nâng cao');
  });
});

describe('RELATIONSHIP_LABELS', () => {
  it('has all relationship types', () => {
    expect(RELATIONSHIP_LABELS['father']).toBe('Bố');
    expect(RELATIONSHIP_LABELS['mother']).toBe('Mẹ');
    expect(RELATIONSHIP_LABELS['guardian']).toBe('Người giám hộ');
  });
});
