import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwuvzdurirfdyouqmwno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('academies')
    .select('id, name, students(count), classes(count)')
    .limit(1);
    
  console.log(JSON.stringify({ data, error }, null, 2));
}
run();
