/**
 * Core database types for CourtManager
 * These interfaces match the Supabase schema and provide base types for UI components.
 */

export interface Academy {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  academy_id: string;
  full_name: string;
  is_active: boolean;
  date_of_birth?: string;
  skill_level?: string;
  gender?: 'male' | 'female' | 'other';
  health_notes?: string;
  created_at: string;
}

export interface Class {
  id: string;
  academy_id: string;
  name: string;
  age_group?: string;
  sport?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  student_id: string;
  parent_name: string;
  phone: string;
  relationship: string;
  access_token: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

/**
 * Deprecated Financial Types - Commented out for operational focus
 * 
export interface Payment {
  id: string;
  student_id: string;
  academy_id: string;
  fee_plan_id?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export interface FeePlan {
  id: string;
  academy_id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
}
*/

export interface Schedule {
  id: string;
  class_id: string;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
  location?: string;
  is_active: boolean;
}

export interface StaffCheckin {
  id: string;
  academy_id: string;
  coach_id: string;
  schedule_id: string;
  location_lat: number;
  location_lng: number;
  distance_m: number;
  is_valid: boolean;
  notes?: string;
  created_at: string;
}
