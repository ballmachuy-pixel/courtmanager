-- ======================================================
-- Migration 004: Support Multiple Coaches per Schedule
-- Author: Winston (System Architect)
-- ======================================================

BEGIN;

-- 1. [CLEANUP] Remove Checkout fields from staff_checkins if they exist
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

-- 2. [SCHEDULE COACHES] Create mapping table for multiple coaches per schedule
CREATE TABLE IF NOT EXISTS public.schedule_coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.academy_members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'assistant', -- 'head' or 'assistant'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_coaches_schedule ON public.schedule_coaches(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_coaches_coach ON public.schedule_coaches(coach_id);

-- Optional constraint to ensure only one head coach per schedule
-- CREATE UNIQUE INDEX IF NOT EXISTS unq_schedule_head_coach ON public.schedule_coaches(schedule_id) WHERE role = 'head';

-- 3. [DATA MIGRATION] Move existing assigned_coach_id to schedule_coaches as 'head'
INSERT INTO public.schedule_coaches (schedule_id, coach_id, role)
SELECT id, assigned_coach_id, 'head'
FROM public.schedules
WHERE assigned_coach_id IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;
