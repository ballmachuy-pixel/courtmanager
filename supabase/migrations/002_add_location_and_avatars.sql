-- ========================================
-- CourtManager — Migration 002
-- Location Geofencing & Avatar Storage
-- ========================================

-- 1. Add Location fields to academies
ALTER TABLE academies 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS allowed_radius_m INTEGER DEFAULT 300;

-- 2. Create staff_checkins table
CREATE TABLE staff_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  coach_id UUID NOT NULL REFERENCES academy_members(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_m DOUBLE PRECISION,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLE
-- ========================================
ALTER TABLE staff_checkins ENABLE ROW LEVEL SECURITY;

-- Owner can see all their academy checkins
CREATE POLICY "owner_view_checkins" ON staff_checkins
  FOR SELECT USING (
    academy_id IN (SELECT id FROM academies WHERE owner_id = auth.uid())
  );

-- Coaches can insert their own checkins
CREATE POLICY "coach_insert_checkins" ON staff_checkins
  FOR INSERT WITH CHECK (
    coach_id IN (SELECT id FROM academy_members WHERE user_id = auth.uid())
  );

-- ========================================
-- STORAGE BUCKETS AND POLICIES
-- ========================================

-- Create Avatars bucket (public read access)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Note: In Supabase, creating storage policies via SQL directly against storage.objects
-- is possible, but relies on accurate schema access. We wrap it safely:
DO $$
BEGIN
  -- Select Policy (Public)
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to Avatars'
  ) THEN
      CREATE POLICY "Public Access to Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;

  -- Insert Policy (Authenticated only)
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Users Upload Avatars'
  ) THEN
      CREATE POLICY "Authenticated Users Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;

  -- Update Policy (Authenticated only)
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Users Update Avatars'
  ) THEN
      CREATE POLICY "Authenticated Users Update Avatars" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;

  -- Delete Policy (Authenticated only)
  IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Users Delete Avatars'
  ) THEN
      CREATE POLICY "Authenticated Users Delete Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;
END $$;
