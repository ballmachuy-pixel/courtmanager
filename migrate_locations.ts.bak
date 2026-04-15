import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Running migration...');
  
  // 1. Create academy_locations table
  const { error: error1 } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS academy_locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        address TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      ALTER TABLE academy_locations ENABLE ROW LEVEL SECURITY;
      
      -- Add location_id to schedules if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schedules' AND column_name='location_id') THEN
          ALTER TABLE schedules ADD COLUMN location_id UUID REFERENCES academy_locations(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `
  });

  if (error1) {
    console.error('Migration failed:', error1);
    // If rpc('exec_sql') is not available, we might need another way or just skip and use metadata.
  } else {
    console.log('Migration successful!');
  }
}

migrate();
