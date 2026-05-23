'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

export async function getLeads() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      trial_requests (
        id,
        trial_date,
        status,
        coach_evaluation,
        schedules (
          id,
          classes (name)
        )
      )
    `)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Failed to fetch leads');
  }

  return data;
}

export async function addLead(studentName: string, parentName: string, parentPhone: string, dateOfBirth: string | null, notes: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('leads')
    .insert({
      academy_id: academyId,
      student_name: studentName,
      parent_name: parentName,
      parent_phone: parentPhone,
      date_of_birth: dateOfBirth || null,
      notes: notes,
      status: 'new'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding lead:', error);
    throw new Error('Failed to add lead');
  }

  revalidatePath('/students/crm');
  return data;
}

export async function updateLeadStatus(leadId: string, status: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)
    .eq('academy_id', academyId);

  if (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Failed to update lead status');
  }

  revalidatePath('/students/crm');
  return { success: true };
}

export async function convertLeadToStudent(leadId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // 1. Get the lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('academy_id', academyId)
    .single();

  if (leadError || !lead) {
    throw new Error('Failed to fetch lead');
  }

  // 2. Insert into students table
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      academy_id: academyId,
      full_name: lead.student_name,
      date_of_birth: lead.date_of_birth,
      is_active: true
    })
    .select()
    .single();

  if (studentError) {
    console.error('Error creating student:', studentError);
    throw new Error('Failed to create student from lead');
  }

  // 3. Mark lead as 'won'
  await supabase
    .from('leads')
    .update({ status: 'won' })
    .eq('id', leadId);

  revalidatePath('/students/crm');
  revalidatePath('/students');
  return student;
}

export async function scheduleTrial(leadId: string, scheduleId: string, trialDate: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // First verify the lead belongs to the academy
  const { data: lead } = await supabase
    .from('leads')
    .select('id')
    .eq('id', leadId)
    .eq('academy_id', academyId)
    .single();

  if (!lead) throw new Error('Lead not found or unauthorized');

  const { data, error } = await supabase
    .from('trial_requests')
    .insert({
      lead_id: leadId,
      schedule_id: scheduleId,
      trial_date: trialDate,
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) {
    console.error('Error scheduling trial:', error);
    throw new Error('Failed to schedule trial');
  }

  // Update lead status to scheduled
  await supabase
    .from('leads')
    .update({ status: 'scheduled' })
    .eq('id', leadId);

  revalidatePath('/students/crm');
  return data;
}

export async function submitCoachEvaluation(trialId: string, leadId: string, evaluation: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Update trial request
  const { error } = await supabase
    .from('trial_requests')
    .update({ 
      coach_evaluation: evaluation,
      status: 'attended'
    })
    .eq('id', trialId);

  if (error) {
    console.error('Error submitting evaluation:', error);
    throw new Error('Failed to submit evaluation');
  }

  // Update lead status
  await supabase
    .from('leads')
    .update({ status: 'trialed' })
    .eq('id', leadId);

  revalidatePath('/attendance');
  revalidatePath('/students/crm');
  return { success: true };
}
