-- =========================================================================
-- COURTMANAGER V2.1: PERFORMANCE INDEXES (High Traffic Readiness)
-- Author: Winston (System Architect)
-- Targets: Optimized reports and concurrent attendance marking
-- =========================================================================

-- 1. [ATTENDANCES] Tối ưu hóa báo cáo chuyên cần và bộ lọc Dashboard
-- Giúp truy vấn WHERE academy_id = ? AND date = ? chạy cực nhanh
CREATE INDEX IF NOT EXISTS idx_attendances_academy_date 
ON public.attendances(academy_id, date);

-- 2. [STAFF_CHECKINS] Tối ưu hóa giám sát HLV theo thời gian thực
-- Giúp Dashboard liệt kê các check-in trong ngày (v2.0 dashboard logic)
CREATE INDEX IF NOT EXISTS idx_staff_checkins_academy_created 
ON public.staff_checkins(academy_id, created_at);

-- 3. [SCHEDULES] Tối ưu hóa việc tìm lịch học theo ngày trong tuần
-- Giúp Dashboard và trang Điểm danh load danh sách ca học nhanh hơn
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week 
ON public.schedules(day_of_week);

-- 4. [STUDENT_CLASSES] Tối ưu hóa việc tìm danh sách học sinh theo lớp
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id 
ON public.student_classes(class_id);

-- 5. [STUDENTS] Tối ưu hóa việc tìm học sinh theo phụ huynh (Báo cáo Portal)
CREATE INDEX IF NOT EXISTS idx_students_parent_id 
ON public.students(parent_id);

COMMENT ON INDEX idx_attendances_academy_date IS 'Optimizes operational dashboard and student reports';
COMMENT ON INDEX idx_staff_checkins_academy_created IS 'Required for real-time staff monitoring grid';
