-- ============================================================
-- [BMAD QA Team] CourtManager — Full Schema Audit Script
-- Chạy script này trong Supabase SQL Editor để kiểm tra
-- toàn bộ schema thực tế so với types.ts và code
-- ============================================================

-- ─────────────────────────────────────────
-- AUDIT 1: Danh sách tất cả bảng
-- ─────────────────────────────────────────
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ─────────────────────────────────────────
-- AUDIT 2: Chi tiết cột từng bảng
-- ─────────────────────────────────────────
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ─────────────────────────────────────────
-- AUDIT 3: Xác nhận attendances KHÔNG có academy_id
-- (Bug đã fix trong reports.ts)
-- ─────────────────────────────────────────
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'attendances'
ORDER BY ordinal_position;
-- Expected columns: id, student_id, class_id, schedule_id, date, status, note, marked_by, created_at
-- NOT expected: academy_id (confirms reports.ts bug was real)

-- ─────────────────────────────────────────
-- AUDIT 4: Xác nhận parent_profiles có token_expires_at
-- (Added in migration 003)
-- ─────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'parent_profiles'
ORDER BY ordinal_position;
-- Must include: token_expires_at (timestamptz)

-- ─────────────────────────────────────────
-- AUDIT 5: Xác nhận staff_checkins có đúng cột
-- ─────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'staff_checkins'
ORDER BY ordinal_position;
-- Expected: id, academy_id, schedule_id, coach_id, latitude, longitude, distance_m, is_valid, notes, created_at

-- ─────────────────────────────────────────
-- AUDIT 6: Xác nhận student_classes có remaining_sessions
-- (Added in migration 003)
-- ─────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_classes'
ORDER BY ordinal_position;
-- Must include: remaining_sessions (integer)

-- ─────────────────────────────────────────
-- AUDIT 7: Kiểm tra tất cả indexes
-- ─────────────────────────────────────────
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ─────────────────────────────────────────
-- AUDIT 8: Kiểm tra RLS đã bật chưa
-- ─────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- All rowsecurity values must be TRUE

-- ─────────────────────────────────────────
-- AUDIT 9: Liệt kê tất cả RLS Policies
-- ─────────────────────────────────────────
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ─────────────────────────────────────────
-- AUDIT 10: Kiểm tra Foreign Keys
-- ─────────────────────────────────────────
SELECT
  tc.table_name AS source_table,
  kcu.column_name AS source_column,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = rc.unique_constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ─────────────────────────────────────────
-- AUDIT 11: Data Health Check
-- (Kiểm tra dữ liệu thực tế không bị orphan)
-- ─────────────────────────────────────────

-- 11a. Học viên không có parent_profiles
SELECT s.id, s.full_name, s.academy_id
FROM students s
LEFT JOIN parent_profiles pp ON pp.student_id = s.id
WHERE pp.id IS NULL
  AND s.is_active = true;
-- Expected: 0 rows (mỗi học viên phải có ít nhất 1 parent)

-- 11b. Classes không có coach
SELECT id, name, academy_id
FROM classes
WHERE coach_id IS NULL
  AND is_active = true;
-- Warning if > 0 rows: lớp học đang không có HLV được gán

-- 11c. Attendances có student_id không tồn tại trong students
SELECT a.id, a.student_id, a.date
FROM attendances a
LEFT JOIN students s ON s.id = a.student_id
WHERE s.id IS NULL
LIMIT 10;
-- Expected: 0 rows (orphan records = data corruption)

-- 11d. Staff checkins của coach không còn active
SELECT sc.id, sc.created_at, sc.academy_id
FROM staff_checkins sc
LEFT JOIN academy_members am ON am.id = sc.coach_id
WHERE am.id IS NULL OR am.is_active = false
LIMIT 10;
-- Warning nếu có rows: checkin thuộc về HLV đã bị xóa/vô hiệu hóa

-- ─────────────────────────────────────────
-- AUDIT 12: Kiểm tra UNIQUE constraints
-- ─────────────────────────────────────────
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  string_agg(kcu.column_name, ', ') AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
  AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name;
-- Key check: attendances has UNIQUE(student_id, class_id, date) = upsert safe
