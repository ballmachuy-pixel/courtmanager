/**
 * AttendanceService — Core attendance business logic.
 *
 * Extracted from actions/attendance.ts per Architecture Document:
 * "Logic nghiệp vụ không được rò rỉ ra ngoài thư mục services."
 *
 * This service is framework-agnostic and testable without Next.js context.
 */

import { getICTDateString } from '@/lib/utils';
import { createAdminClient } from '@/lib/supabase/service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttendanceInput {
  studentId: string;
  classId: string;
  scheduleId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

export interface AttendanceValidationResult {
  isValid: boolean;
  error?: string;
  finalNote: string | null;
  isBackfill: boolean;
}

// ─── Date Validation ─────────────────────────────────────────────────────────

/**
 * Validate attendance date:
 *  - Cannot be in the future
 *  - Cannot be more than 7 days in the past
 *  - Auto-tags backfill entries
 */
export function validateAttendanceDate(
  date: string,
  note?: string
): AttendanceValidationResult {
  const todayStr = getICTDateString();

  // Future check
  if (date > todayStr) {
    return {
      isValid: false,
      error: 'Không thể điểm danh cho ngày trong tương lai.',
      finalNote: null,
      isBackfill: false,
    };
  }

  // 7-day limit check
  const targetDate = new Date(date);
  const currentDate = new Date(todayStr);
  const diffTime = Math.abs(currentDate.getTime() - targetDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    return {
      isValid: false,
      error: 'Chỉ có thể điểm danh bù trong vòng 7 ngày gần nhất.',
      finalNote: null,
      isBackfill: false,
    };
  }

  // Backfill tagging
  const isBackfill = date < todayStr;
  const finalNote = isBackfill
    ? `[Điểm danh bù] ${note || ''}`.trim()
    : note || null;

  return {
    isValid: true,
    finalNote,
    isBackfill,
  };
}

// ─── Data Layer Helpers ──────────────────────────────────────────────────────

/**
 * Common upsert logic for both Admin and Coach portals.
 * Ensures multi-tenant isolation via academyId.
 */
export async function upsertAttendanceRecord(
  academyId: string,
  input: AttendanceInput,
  markedBy: string // UUID of the admin or coach member
) {
  const supabase = createAdminClient();

  return await supabase
    .from('attendances')
    .upsert({
      academy_id: academyId,
      student_id: input.studentId,
      class_id: input.classId,
      schedule_id: input.scheduleId,
      date: input.date,
      status: input.status,
      note: input.note || null,
      marked_by: markedBy
    }, { onConflict: 'student_id, schedule_id, date' });
}

