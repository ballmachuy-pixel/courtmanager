const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://iwuvzdurirfdyouqmwno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo'
);

async function check() {
  const { data, error } = await supabase
    .from('academy_members')
    .select('id, display_name, avatar_url')
    .eq('academy_id', '03dc9b25-9dac-4e78-94c2-3ed8da63f061')
    .in('role', ['coach', 'admin']);

  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

check();
