'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';

export async function getCoachesWithContracts() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('academy_members')
    .select(`
      id,
      display_name,
      employee_code,
      base_salary,
      per_session_rate,
      is_active
    `)
    .eq('academy_id', academyId)
    .in('role', ['coach', 'admin'])
    .order('display_name');

  if (error) {
    console.error('Error fetching coach contracts:', error);
    throw new Error('Failed to fetch contracts');
  }

  return data;
}

export async function updateCoachContract(coachId: string, baseSalary: number, perSessionRate: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('academy_members')
    .update({
      base_salary: baseSalary,
      per_session_rate: perSessionRate
    })
    .eq('academy_id', academyId)
    .eq('id', coachId);

  if (error) {
    console.error('Error updating contract:', error);
    throw new Error('Failed to update contract');
  }

  return { success: true };
}

export async function calculateMonthlyPayroll(month: number, year: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // 1. Get all active coaches with their contracts
  const { data: coaches, error: coachesError } = await supabase
    .from('academy_members')
    .select('id, display_name, base_salary, per_session_rate')
    .eq('academy_id', academyId)
    .in('role', ['coach', 'admin'])
    .eq('is_active', true);

  if (coachesError) throw new Error('Failed to fetch coaches');

  // 2. Determine start and end date for the given month
  // Note: JavaScript months are 0-indexed in Date constructor (0 = Jan)
  // But our 'month' parameter is 1-12.
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();

  // 3. Get all VALID check-ins for the month
  const { data: checkins, error: checkinsError } = await supabase
    .from('staff_checkins')
    .select('coach_id, id')
    .eq('academy_id', academyId)
    .eq('is_valid', true)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (checkinsError) throw new Error('Failed to fetch check-ins');

  // Count check-ins per coach
  const checkinCounts = checkins.reduce((acc: any, curr) => {
    acc[curr.coach_id] = (acc[curr.coach_id] || 0) + 1;
    return acc;
  }, {});

  // 4. Get existing payrolls for this month to check status
  const { data: existingPayrolls, error: payrollsError } = await supabase
    .from('payrolls')
    .select('*')
    .eq('academy_id', academyId)
    .eq('month', month)
    .eq('year', year);

  if (payrollsError) throw new Error('Failed to fetch existing payrolls');

  const payrollMap = existingPayrolls.reduce((acc: any, curr) => {
    acc[curr.manager_id] = curr;
    return acc;
  }, {});

  // 5. Generate draft payrolls
  const results = coaches.map((coach) => {
    const sessionCount = checkinCounts[coach.id] || 0;
    const sessionBonus = sessionCount * (coach.per_session_rate || 0);
    const baseAmount = coach.base_salary || 0;
    const totalAmount = baseAmount + sessionBonus;
    
    const existing = payrollMap[coach.id];

    return {
      manager_id: coach.id,
      display_name: coach.display_name,
      base_amount: baseAmount,
      per_session_rate: coach.per_session_rate || 0,
      session_count: sessionCount,
      session_bonus: sessionBonus,
      total_amount: totalAmount,
      status: existing?.status || 'draft',
      payroll_id: existing?.id || null
    };
  });

  return results;
}

export async function paySalary(managerId: string, month: number, year: number, baseAmount: number, sessionCount: number, sessionBonus: number, totalAmount: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Upsert the payroll record as 'paid'
  const { error } = await supabase
    .from('payrolls')
    .upsert({
      academy_id: academyId,
      manager_id: managerId,
      month: month,
      year: year,
      base_amount: baseAmount,
      session_count: sessionCount,
      session_bonus: sessionBonus,
      total_amount: totalAmount,
      status: 'paid'
    }, {
      onConflict: 'academy_id, manager_id, month, year'
    });

  if (error) {
    console.error('Error paying salary:', error);
    throw new Error('Failed to pay salary');
  }

  return { success: true };
}
