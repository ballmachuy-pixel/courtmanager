-- Migration 010: Hệ thống VIP Loyalty (Epic 6)

-- 1. Thêm cột Cache tĩnh `total_enrollments` vào bảng `students`
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS total_enrollments INTEGER DEFAULT 0;

-- 2. Cập nhật lại dữ liệu lịch sử cho các học sinh đang học
UPDATE public.students
SET total_enrollments = (
    SELECT COUNT(*)
    FROM public.student_classes
    WHERE student_classes.student_id = students.id
);

-- 3. Tạo Hàm (Function) tính toán mỗi khi có học sinh vào lớp/rút khỏi lớp
CREATE OR REPLACE FUNCTION public.update_student_total_enrollments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.students
        SET total_enrollments = total_enrollments + 1
        WHERE id = NEW.student_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.students
        SET total_enrollments = total_enrollments - 1
        WHERE id = OLD.student_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Xóa Trigger cũ (nếu có để tránh trùng lặp) và gắn Trigger mới vào bảng `student_classes`
DROP TRIGGER IF EXISTS trigger_update_enrollments ON public.student_classes;
CREATE TRIGGER trigger_update_enrollments
AFTER INSERT OR DELETE ON public.student_classes
FOR EACH ROW
EXECUTE FUNCTION public.update_student_total_enrollments();
