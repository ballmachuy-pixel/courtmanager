-- ========================================
-- CourtManager — Migration 009
-- Super Admin Control Tower V3 (Mini-CRM)
-- ========================================

ALTER TABLE academies
ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'active' CHECK (access_status IN ('active', 'suspended')),
ADD COLUMN IF NOT EXISTS last_attendance_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
