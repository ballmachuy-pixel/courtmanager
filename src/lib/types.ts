// ========================================
// CourtManager — TypeScript Types
// ========================================

export type UserRole = 'owner' | 'admin' | 'coach';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
/*
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo';
export type BillingCycle = 'monthly' | 'per_session' | 'per_course';
*/
export type AnnouncementTarget = 'all' | 'class' | 'student';
export type ParentRelationship = 'father' | 'mother' | 'guardian';
export type SubscriptionTier = 'free' | 'pro' | 'premium';

// ---- Database Models ----

export interface Academy {
  id: string;
  name: string;
  sport_type: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  latitude?: number | null;
  longitude?: number | null;
  allowed_radius_m?: number | null;
  owner_id: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AcademyMember {
  id: string;
  academy_id: string;
  user_id: string | null;
  role: UserRole;
  employee_code: string;
  pin_hash: string;
  display_name: string;
  must_change_pin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  academy_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  health_notes: string | null;
  skill_level: SkillLevel;
  is_active: boolean;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  student_id: string;
  parent_name: string;
  phone: string;
  email: string | null;
  relationship: ParentRelationship;
  access_token: string;
  token_expires_at?: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  academy_id: string;
  name: string;
  age_group: string | null;
  skill_level: SkillLevel | null;
  max_students: number;
  coach_id: string | null;
  created_at: string;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_date: string;
  remaining_sessions?: number;
}

export interface Schedule {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  coach_id: string | null;
  is_active: boolean;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  schedule_id: string | null;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  marked_by: string | null;
  created_at: string;
}

export interface StaffCheckin {
  id: string;
  academy_id: string;
  schedule_id: string | null;
  coach_id: string;
  latitude: number | null;
  longitude: number | null;
  distance_m: number | null;
  is_valid: boolean;
  notes: string | null;
  created_at: string;
}

/*
export interface FeePlan {
  id: string;
  academy_id: string;
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  session_count: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_plan_id: string | null;
  academy_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
}
*/

export interface Announcement {
  id: string;
  academy_id: string;
  title: string;
  content: string;
  target: AnnouncementTarget;
  target_id: string | null;
  created_by: string | null;
  created_at: string;
}

// ---- Extended / Joined Types ----

export interface StudentWithParent extends Student {
  parent_profiles: ParentProfile[];
}

export interface StudentWithClasses extends Student {
  student_classes: (StudentClass & { classes: Class })[];
}

export interface ClassWithStudents extends Class {
  student_classes: (StudentClass & { students: Student })[];
  schedules: Schedule[];
  coach?: AcademyMember;
}

/*
export interface PaymentWithStudent extends Payment {
  students: Student;
  fee_plans: FeePlan | null;
}
*/

// ---- UI Types ----

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  /*
  total_revenue: number;
  pending_payments: number;
  */
  attendance_rate: number;
  total_classes: number;
}

// ---- Auth Types ----

export interface CoachSession {
  member_id: string;
  academy_id: string;
  role: UserRole;
  display_name: string;
  employee_code: string;
  must_change_pin: boolean;
}
