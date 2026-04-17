-- =========================================================================
-- COURTMANAGER MIGRATION V2.0: RESTRUCTURE & OPTIMIZATION
-- Author: Winston (System Architect)
-- Goals: 
--  1. Global Parent management (1-N relationship)
--  2. Precise Attendance tracking (Schedule-linked + Academy ID)
--  3. Role clarity (Head Coach vs Assigned Coach)
--  4. Remove Financial modules
-- =========================================================================

BEGIN;

-- 1. [CLEANUP] Loại bỏ các bảng Tài chính (theo yêu cầu)
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.fee_plans;

-- 2. [PARENTS] Tạo bảng Phụ huynh mới
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    access_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_parents_academy_id ON public.parents(academy_id);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON public.parents(phone);
CREATE INDEX IF NOT EXISTS idx_parents_access_token ON public.parents(access_token);

-- 3. [DATA MIGRATION] Di chuyển dữ liệu từ parent_profiles sang parents
-- Chúng ta sẽ gộp các hồ sơ phụ huynh có cùng số điện thoại trong cùng một trung tâm
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parent_profiles') THEN
        INSERT INTO public.parents (academy_id, full_name, phone, email, access_token, token_expires_at, created_at)
        SELECT DISTINCT ON (pp.phone, s.academy_id) 
            s.academy_id, 
            pp.parent_name, 
            pp.phone, 
            pp.email, 
            pp.access_token, 
            pp.token_expires_at, 
            pp.created_at
        FROM public.parent_profiles pp
        JOIN public.students s ON s.id = pp.student_id
        ON CONFLICT (access_token) DO NOTHING;
    END IF;
END $$;

-- 4. [STUDENTS] Cấu trúc lại quan hệ Student -> Parent
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL;

-- Cập nhật parent_id cho học sinh dựa trên dữ liệu cũ
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parent_profiles') THEN
        UPDATE public.students s
        SET parent_id = p.id
        FROM public.parents p
        JOIN public.parent_profiles pp ON pp.phone = p.phone
        WHERE pp.student_id = s.id AND p.academy_id = s.academy_id;
    END IF;
END $$;

-- Hiện tại có thể xóa bảng cũ parent_profiles (User đã cho phép di chuyển dữ liệu)
DROP TABLE IF EXISTS public.parent_profiles;

-- 5. [COACHES] Cấu trúc lại vai trò HLV
-- Thêm HLV trưởng cho lớp học
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS head_coach_id UUID REFERENCES public.academy_members(id) ON DELETE SET NULL;

-- Di chuyển dữ liệu HLV hiện tại sang HLV trưởng
UPDATE public.classes SET head_coach_id = coach_id WHERE head_coach_id IS NULL;

-- Thêm HLV thực dạy cho từng buổi học
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS assigned_coach_id UUID REFERENCES public.academy_members(id) ON DELETE SET NULL;

-- Mặc định HLV thực dạy là HLV trưởng của lớp đó
UPDATE public.schedules s
SET assigned_coach_id = c.head_coach_id
FROM public.classes c
WHERE s.class_id = c.id AND s.assigned_coach_id IS NULL;

-- 6. [ATTENDANCE] Nâng cấp tính chính xác
-- Thêm academy_id để tối ưu báo cáo
ALTER TABLE public.attendances ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE;

-- Cập nhật academy_id từ thông tin học sinh
UPDATE public.attendances a
SET academy_id = s.academy_id
FROM public.students s
WHERE a.student_id = s.id AND a.academy_id IS NULL;

-- Đảm bảo schedule_id được điền nếu có thể (logic backend sẽ cần chặt chẽ hơn sau này)
-- Ràng buộc Unique mới: (student, schedule, date)
ALTER TABLE public.attendances DROP CONSTRAINT IF EXISTS attendances_student_id_class_id_date_key;
ALTER TABLE public.attendances ADD CONSTRAINT attendances_student_schedule_date_unique UNIQUE (student_id, schedule_id, date);

-- 7. [RLS] Cập nhật bảo mật cho bảng Parents
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_academy_access" ON public.parents
    FOR ALL USING (
        academy_id IN (
            SELECT id FROM academies WHERE owner_id = auth.uid()
            UNION
            SELECT academy_id FROM academy_members WHERE user_id = auth.uid()
        )
    );

-- 8. [CLEANUP] Xóa bỏ các cột cũ không dùng tới
-- Lưu ý: Chúng ta giữ coach_id ở classes tạm thời nếù cần đối soát, nhưng theo thiết kế mới nên dùng head_coach_id
-- Winston khuyên nên xóa sau khi refactor code xong.

COMMIT;
