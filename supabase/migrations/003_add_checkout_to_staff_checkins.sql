-- ======================================================
-- Migration 003: Add Check-out features to staff_checkins
-- Author: Winston (System Architect)
-- ======================================================

-- Add checkout columns to staff_checkins
ALTER TABLE public.staff_checkins
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkout_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_distance_m DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS checkout_is_valid BOOLEAN,
  ADD COLUMN IF NOT EXISTS checkout_notes TEXT;

-- Update distance column to be more descriptive (already exists but for clarity)
COMMENT ON COLUMN public.staff_checkins.distance_m IS 'Distance from academy/location at check-in time';
COMMENT ON COLUMN public.staff_checkins.checkout_distance_m IS 'Distance from academy/location at check-out time';

-- Optional: Create a view or index if needed for reporting later
CREATE INDEX IF NOT EXISTS idx_staff_checkins_coach_date 
ON public.staff_checkins(coach_id, created_at);
