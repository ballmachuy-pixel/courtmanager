-- =========================================================================
-- SUPER OPTIMIZATION MIGRATION
-- Adds Multi-tenant Indexing & Soft Delete Support
-- =========================================================================

-- 1. Thêm cơ chế Soft Delete (is_active) vào Bảng quản lý Lớp Học và Lịch Học
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Xây dải phân cách (Index) cho toàn bộ các Query truy xuất dữ liệu theo Academy ID (Multi-tenant)
CREATE INDEX IF NOT EXISTS idx_classes_academy_id ON public.classes(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_academy_id ON public.students(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_members_academy_id ON public.academy_members(academy_id);
CREATE INDEX IF NOT EXISTS idx_fee_plans_academy_id ON public.fee_plans(academy_id);
CREATE INDEX IF NOT EXISTS idx_payments_academy_id ON public.payments(academy_id);

-- 3. Xây cao tốc (Index) cho các Bảng Dữ Liệu Lớn (Big Data Tables) để tăng tốc Check-in Report
CREATE INDEX IF NOT EXISTS idx_attendances_class_id ON public.attendances(class_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON public.attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON public.attendances(date);

CREATE INDEX IF NOT EXISTS idx_staff_checkins_academy_id ON public.staff_checkins(academy_id);
CREATE INDEX IF NOT EXISTS idx_staff_checkins_created_at ON public.staff_checkins(created_at);

CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON public.schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON public.schedules(day_of_week);
