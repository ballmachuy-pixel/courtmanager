/**
 * Core database types for CourtManager (v2.0 Redesign)
 * These interfaces match the restructuring for:
 * 1. Global Parent-Student (1-N)
 * 2. Head Coach vs Assigned Coach
 * 3. Enhanced Attendance Analytics
 */

export interface Academy {
  id: string;
  name: string;
  owner_id: string;
  latitude?: number;
  longitude?: number;
  allowed_radius_m?: number;
  created_at: string;
}

export interface Parent {
  id: string;
  academy_id: string;
  full_name: string;
  phone: string;
  email?: string;
  access_token: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  academy_id: string;
  parent_id: string; // Linked to Parent table
  parent_relationship: string; // [MỚI] Mối quan hệ với phụ huynh (Bố/Mẹ/Giám hộ)
  full_name: string;
  is_active: boolean;
  date_of_birth?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string;
  health_notes?: string;
  created_at: string;
}

export interface Class {
  id: string;
  academy_id: string;
  name: string;
  age_group?: string;
  skill_level?: string;
  description?: string;
  head_coach_id?: string; // HLV Trưởng phụ trách lớp
  is_active: boolean;
  created_at: string;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_date: string;
  remaining_sessions: number;
}

export interface Schedule {
  id: string;
  class_id: string;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
  location?: string;
  assigned_coach_id?: string; // HLV Thực dạy buổi này
  is_active: boolean;
}

export interface Attendance {
  id: string;
  academy_id: string; // Required for optimized reporting
  student_id: string;
  class_id: string;
  schedule_id: string; // Linked directly to schedule session
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
  marked_by?: string;
  created_at: string;
}

export interface StaffCheckin {
  id: string;
  academy_id: string;
  coach_id: string;
  schedule_id: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  is_valid: boolean;
  notes?: string;
  created_at: string;
}

export interface ScheduleCoach {
  id: string;
  schedule_id: string;
  coach_id: string;
  role: 'head' | 'assistant';
  created_at: string;
}


// ---- APP & AUTH TYPES ----

export type UserRole = 'owner' | 'admin' | 'coach';

export interface CoachSession {
  member_id: string;
  academy_id: string;
  role: UserRole;
  display_name: string;
  employee_code: string;
  must_change_pin: boolean;
}

export interface AttendanceWithDetails {
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string | null;
  classes?: {
    name: string;
  } | { name: string }[];
}
