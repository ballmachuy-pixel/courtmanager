'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';

export async function createShiftLog(note: string, snapshot: any) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not logged in');

  const { error } = await supabase.from('shift_logs').insert({
    academy_id: academyId,
    manager_id: userData.user.id,
    shift_note: note,
    unresolved_issues: snapshot
  });

  if (error) {
    console.error('Error creating shift log:', error);
    throw new Error('Failed to save shift log');
  }

  return { success: true };
}

export async function getLatestShiftLog() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return null;

  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('shift_logs')
    .select(`
      id, 
      shift_note, 
      created_at,
      manager_id
    `)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching shift log:', error);
    return null;
  }

  if (!data) return null;

  // Get display name manually
  const { data: memberData } = await supabase
    .from('academy_members')
    .select('display_name')
    .eq('academy_id', academyId)
    .eq('user_id', data.manager_id)
    .single();

  return {
    ...data,
    academy_members: {
      display_name: memberData?.display_name || 'Quản lý'
    }
  };
}
