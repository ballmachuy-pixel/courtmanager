const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://iwuvzdurirfdyouqmwno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dXZ6ZHVyaXJmZHlvdXFtd25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5OTkyMSwiZXhwIjoyMDkxMjc1OTIxfQ.azISVW1C9CWUVcMHtFjzeTBHt-cCjrot855hC-JmPOo'
);

function getICTStartOfDayUTC() {
  const now = new Date();
  const ictOffsetMillis = 7 * 60 * 60 * 1000;
  const ictTime = new Date(now.getTime() + ictOffsetMillis);
  const ictMidnight = new Date(ictTime);
  ictMidnight.setUTCHours(0, 0, 0, 0);
  return new Date(ictMidnight.getTime() - ictOffsetMillis);
}

async function check() {
  const todayStart = getICTStartOfDayUTC();
  console.log("todayStart:", todayStart.toISOString());
  
  const { data, error } = await supabase
      .from('staff_checkins')
      .select('*, academy_members(display_name), schedules(classes(name))')
      .eq('academy_id', '03dc9b25-9dac-4e78-94c2-3ed8da63f061')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(data, null, 2));
}

check();
