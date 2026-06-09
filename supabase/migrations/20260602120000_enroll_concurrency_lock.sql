-- Migration: Concurrency Lock cho luồng ghi danh (Enrollment)
-- Sử dụng Row-level locking (FOR UPDATE) để ngăn chặn race condition khi nhiều người cùng đăng ký vào lớp.

CREATE OR REPLACE FUNCTION enroll_student_safe(p_student_id UUID, p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INT;
  v_max_students INT;
BEGIN
  -- 1. Khóa row của class này lại (FOR UPDATE) để các transaction khác phải đợi
  SELECT max_students INTO v_max_students
  FROM classes
  WHERE id = p_class_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy lớp học';
  END IF;

  -- 2. Đếm số lượng học viên hiện tại
  SELECT count(*) INTO v_current_count
  FROM student_classes
  WHERE class_id = p_class_id;

  -- 3. Kiểm tra sức chứa
  IF v_current_count >= v_max_students THEN
    RAISE EXCEPTION 'Lớp học đã đạt số lượng tối đa (%)', v_max_students;
  END IF;

  -- 4. Ghi danh (Insert)
  -- Bỏ qua lỗi duplicate nếu học viên đã ở trong lớp
  BEGIN
    INSERT INTO student_classes (student_id, class_id)
    VALUES (p_student_id, p_class_id);
  EXCEPTION WHEN unique_violation THEN
    -- Đã ở trong lớp rồi, không sao cả
    RETURN TRUE;
  END;

  RETURN TRUE;
END;
$$;
