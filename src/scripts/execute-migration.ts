
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwuvzdurirfdyouqmwno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo';

const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCE_ID = '03dc9b25-9dac-4e78-94c2-3ed8da63f061'; // SUNDAY SUNSET
const TARGET_ID = '9559b837-79d1-4af7-8b48-5ed81a43586f'; // New Line

const CLASSES_TO_DELETE = [
  'f61949bf-9946-46b7-8d05-1a373c04e0fc', // Cầu lông cơ bản
  '83e69899-68f4-483f-8161-da4150f01344'  // Cầu lông nâng cao
];

async function migrate() {
  console.log('Starting migration...');

  // 1. Delete classes in New Line
  const { error: deleteError } = await supabase
    .from('classes')
    .delete()
    .in('id', CLASSES_TO_DELETE);
  
  if (deleteError) {
    console.error('Error deleting classes:', deleteError);
    return;
  }
  console.log('Deleted 2 test classes in New Line.');

  // 2. Move 3 classes from Sunday Sunset
  const { error: moveClassesError } = await supabase
    .from('classes')
    .update({ 
      academy_id: TARGET_ID,
      coach_id: null 
    })
    .eq('academy_id', SOURCE_ID);

  if (moveClassesError) {
    console.error('Error moving classes:', moveClassesError);
    return;
  }
  console.log('Moved basketball classes to New Line.');

  // 3. Move students from Sunday Sunset
  const { error: moveStudentsError } = await supabase
    .from('students')
    .update({ academy_id: TARGET_ID })
    .eq('academy_id', SOURCE_ID);

  if (moveStudentsError) {
    console.error('Error moving students:', moveStudentsError);
    return;
  }
  console.log('Moved all students to New Line.');

  console.log('Migration completed successfully!');
}

migrate();
