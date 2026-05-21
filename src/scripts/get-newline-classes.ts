
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwuvzdurirfdyouqmwno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('academy_id', '9559b837-79d1-4af7-8b48-5ed81a43586f');
  
  if (error) {
    console.error(error);
  } else {
    console.log('NEWLINE_CLASSES_RESULT:' + JSON.stringify(data));
  }
}

run();
