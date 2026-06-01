const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://iwuvzdurirfdyouqmwno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo'
);

async function check() {
  const { data, error } = await supabase.from('attendances').select('schedule_id, status').eq('date', '2026-06-01');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  console.log('Sample data:', data?.[0]);
}
check();
