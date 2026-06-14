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
  const scheduleId = '15f55109-691a-4e7a-b8ef-edf910e3dc4e';
  const coachId = 'a5cddc6e-e1d4-4045-a1b7-5d543bfa8cb1'; // Minh
  const academyId = '03dc9b25-9dac-4e78-94c2-3ed8da63f061';
  const todayStart = getICTStartOfDayUTC();

  const { data: checkinRecord, error: checkinErr } = await supabase
    .from('staff_checkins')
    .select('id')
    .eq('coach_id', coachId)
    .eq('schedule_id', scheduleId)
    .gte('created_at', todayStart.toISOString())
    .maybeSingle();

  console.log("checkinRecord:", checkinRecord, checkinErr);

  const { data: allCoachesData, error: coachesErr } = await supabase
    .from('academy_members')
    .select('id, display_name')
    .eq('academy_id', academyId)
    .in('role', ['coach', 'admin']);

  console.log("allCoachesData:", allCoachesData, coachesErr);

  const isCheckedIn = !!checkinRecord;
  const assistants = (allCoachesData || []).filter(c => c.id !== coachId);
  console.log("isCheckedIn:", isCheckedIn);
  console.log("assistants length:", assistants.length);
  console.log("assistants:", assistants);
}

check();
