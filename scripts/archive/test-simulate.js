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

async function simulate() {
  try {
    const scheduleId = '15f55109-691a-4e7a-b8ef-edf910e3dc4e';
    const academyId = '03dc9b25-9dac-4e78-94c2-3ed8da63f061';
    const coachId = 'a5cddc6e-e1d4-4045-a1b7-5d543bfa8cb1';
    const todayStart = getICTStartOfDayUTC();
    
    // 1. Check check-in
    const { data: checkinRecord, error: checkinErr } = await supabase
      .from('staff_checkins')
      .select('id')
      .eq('coach_id', coachId)
      .eq('schedule_id', scheduleId)
      .gte('created_at', todayStart.toISOString())
      .maybeSingle();
      
    if (checkinErr) throw checkinErr;
    const isCheckedIn = !!checkinRecord;
    console.log("isCheckedIn:", isCheckedIn);
    
    // 2. Fetch coaches
    const { data: allCoachesData, error: coachErr } = await supabase
      .from('academy_members')
      .select('id, display_name')
      .eq('academy_id', academyId)
      .in('role', ['coach', 'admin']);
      
    if (coachErr) throw coachErr;
    console.log("allCoachesData:", allCoachesData);
    
    // 3. Render logic
    if (isCheckedIn) {
      const allCoaches = allCoachesData || [];
      const assistants = allCoaches.filter(c => c.id !== coachId);
      console.log("assistants:", assistants);
      if (assistants.length === 0) {
        console.log("Component will return null because assistants.length === 0");
      } else {
        console.log("Component SHOULD render!");
      }
    } else {
      console.log("Component will NOT render because isCheckedIn is false");
    }
  } catch (err) {
    console.error("Simulation error:", err);
  }
}

simulate();
