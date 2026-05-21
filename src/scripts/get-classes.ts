
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwuvzdurirfdyouqmwno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('academy_id', '03dc9b25-9dac-4e78-94c2-3ed8da63f061');
  
  if (error) {
    console.error(error);
  } else {
    console.log('CLASSES_RESULT:' + JSON.stringify(data));
  }
}

run();
