-- ======================================================
-- Migration 005: Finalize Simplified Coach Attendance
-- Multi-coach support per schedule & Audit tracking
-- ======================================================

BEGIN;

-- 1. [CLEANUP] Remove Checkout fields from staff_checkins if they exist
-- This ensures Migration 003 logic is reverted in favor of single-action check-in
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_checkins' AND column_name='checked_out_at') THEN
        ALTER TABLE public.staff_checkins
        DROP COLUMN IF EXISTS checked_out_at,
        DROP COLUMN IF EXISTS checkout_latitude,
        DROP COLUMN IF EXISTS checkout_longitude,
        DROP COLUMN IF EXISTS checkout_distance_m,
        DROP COLUMN IF EXISTS checkout_is_valid,
        DROP COLUMN IF EXISTS checkout_notes;
    END IF;
END $$;

-- 2. [SCHEDULE COACHES] Create mapping table for multiple coaches per schedule (if not exists)
CREATE TABLE IF NOT EXISTS public.schedule_coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'assistant', -- 'head' or 'assistant'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(schedule_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_coaches_schedule ON public.schedule_coaches(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_coaches_coach ON public.schedule_coaches(coach_id);

-- 3. [DATA MIGRATION] Move existing coach_id or assigned_coach_id from schedules to schedule_coaches as 'head'
-- Check for both possible column names from legacy migrations
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='assigned_coach_id') THEN
        INSERT INTO public.schedule_coaches (schedule_id, coach_id, role)
        SELECT id, assigned_coach_id, 'head'
        FROM public.schedules
        WHERE assigned_coach_id IS NOT NULL
        ON CONFLICT DO NOTHING;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='coach_id') THEN
        INSERT INTO public.schedule_coaches (schedule_id, coach_id, role)
        SELECT id, coach_id, 'head'
        FROM public.schedules
        WHERE coach_id IS NOT NULL
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 4. [AUDIT TRACKING] Ensure marked_by on attendances table is ready
-- This column was in 001, but we ensure it has an index for admin reporting
CREATE INDEX IF NOT EXISTS idx_attendances_marked_by ON public.attendances(marked_by);

-- 5. [RLS] Add RLS for schedule_coaches
ALTER TABLE public.schedule_coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_view_schedule_coaches" ON public.schedule_coaches
  FOR SELECT USING (
    schedule_id IN (
      SELECT id FROM public.schedules WHERE class_id IN (
        SELECT id FROM public.classes WHERE academy_id IN (
          SELECT academy_id FROM public.academy_members WHERE user_id = auth.uid()
        )
      )
    )
  );

COMMIT;
