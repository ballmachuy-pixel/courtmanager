-- ========================================
-- 🏀 CourtManager - Multi-Location Upgrade
-- Run this SQL in your Supabase SQL Editor
-- ========================================

-- 1. Create academy_locations table
CREATE TABLE IF NOT EXISTS academy_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  allowed_radius_m INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add location_id to schedules
ALTER TABLE schedules 
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES academy_locations(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE academy_locations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Owners can manage their own locations
CREATE POLICY "owners_manage_locations" ON academy_locations
  FOR ALL USING (
    academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())
  );

-- Coaches/Members can view locations
CREATE POLICY "members_view_locations" ON academy_locations
  FOR SELECT USING (
    academy_id IN (SELECT academy_id FROM academy_members WHERE user_id = auth.uid())
  );

-- 5. Helper: Migrate existing academy coordinates to a "Main Court" (Optional but recommended)
-- This ensures existing check-ins don't break
INSERT INTO academy_locations (academy_id, name, address, latitude, longitude, allowed_radius_m)
SELECT id, 'Sân Chính', 'Địa chỉ mặc định', latitude, longitude, allowed_radius_m
FROM academies
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
