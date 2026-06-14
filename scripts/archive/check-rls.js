const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://iwuvzdurirfdyouqmwno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo'
);

async function checkRLS() {
  const { data: policies, error: pgError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'staff_checkins');
    
  console.log("Policies:", policies);
}

checkRLS();
