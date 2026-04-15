-- ========================================
-- CourtManager — Database Schema
-- Multi-tenant SaaS for Youth Sports
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- Academies ----
CREATE TABLE academies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'basketball',
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Academy Members (Admin + Coach) ----
CREATE TABLE academy_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'coach' CHECK (role IN ('owner', 'admin', 'coach')),
  employee_code TEXT NOT NULL,
  pin_hash TEXT,
  display_name TEXT NOT NULL,
  must_change_pin BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(academy_id, employee_code)
);

-- ---- Students ----
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  avatar_url TEXT,
  health_notes TEXT,
  skill_level TEXT NOT NULL DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Parent Profiles ----
CREATE TABLE parent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL DEFAULT 'mother' CHECK (relationship IN ('father', 'mother', 'guardian')),
  access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Classes ----
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  max_students INT NOT NULL DEFAULT 20,
  coach_id UUID REFERENCES academy_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Student ↔ Class (Many-to-Many) ----
CREATE TABLE student_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(student_id, class_id)
);

-- ---- Schedules ----
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  coach_id UUID REFERENCES academy_members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ---- Attendances ----
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  note TEXT,
  marked_by UUID REFERENCES academy_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- ---- Fee Plans ----
CREATE TABLE fee_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 0) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'per_session', 'per_course')),
  session_count INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Payments ----
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_plan_id UUID REFERENCES fee_plans(id) ON DELETE SET NULL,
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  amount DECIMAL(12, 0) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  method TEXT CHECK (method IN ('cash', 'bank_transfer', 'momo')),
  note TEXT,
  recorded_by UUID REFERENCES academy_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Announcements ----
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'class', 'student')),
  target_id UUID,
  created_by UUID REFERENCES academy_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_academy_members_academy ON academy_members(academy_id);
CREATE INDEX idx_academy_members_code ON academy_members(academy_id, employee_code);
CREATE INDEX idx_students_academy ON students(academy_id);
CREATE INDEX idx_students_active ON students(academy_id, is_active);
CREATE INDEX idx_parent_profiles_student ON parent_profiles(student_id);
CREATE INDEX idx_parent_profiles_token ON parent_profiles(access_token);
CREATE INDEX idx_classes_academy ON classes(academy_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_schedules_class ON schedules(class_id);
CREATE INDEX idx_attendances_student_date ON attendances(student_id, date);
CREATE INDEX idx_attendances_class_date ON attendances(class_id, date);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_academy_status ON payments(academy_id, status);
CREATE INDEX idx_announcements_academy ON announcements(academy_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Academy: owner can do everything
CREATE POLICY "academy_owner_all" ON academies
  FOR ALL USING (owner_id = auth.uid());

-- Academy Members: members of same academy can view
CREATE POLICY "members_view_own_academy" ON academy_members
  FOR SELECT USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "members_manage_own_academy" ON academy_members
  FOR ALL USING (
    academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())
  );

-- Students: accessible by academy members
CREATE POLICY "students_academy_access" ON students
  FOR ALL USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

-- Parent Profiles: accessible by academy members
CREATE POLICY "parents_academy_access" ON parent_profiles
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE academy_id IN (
        SELECT id FROM academies WHERE owner_id = auth.uid()
        UNION
        SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
      )
    )
  );

-- Classes: accessible by academy members
CREATE POLICY "classes_academy_access" ON classes
  FOR ALL USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

-- Student Classes: accessible by academy members
CREATE POLICY "student_classes_access" ON student_classes
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE academy_id IN (
        SELECT id FROM academies WHERE owner_id = auth.uid()
        UNION
        SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
      )
    )
  );

-- Schedules: accessible by academy members
CREATE POLICY "schedules_access" ON schedules
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE academy_id IN (
        SELECT id FROM academies WHERE owner_id = auth.uid()
        UNION
        SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
      )
    )
  );

-- Attendances: accessible by academy members
CREATE POLICY "attendances_access" ON attendances
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE academy_id IN (
        SELECT id FROM academies WHERE owner_id = auth.uid()
        UNION
        SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
      )
    )
  );

-- Fee Plans: accessible by academy members
CREATE POLICY "fee_plans_access" ON fee_plans
  FOR ALL USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

-- Payments: accessible by academy members
CREATE POLICY "payments_access" ON payments
  FOR ALL USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );

-- Announcements: accessible by academy members
CREATE POLICY "announcements_access" ON announcements
  FOR ALL USING (
    academy_id IN (
      SELECT id FROM academies WHERE owner_id = auth.uid()
      UNION
      SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
    )
  );
