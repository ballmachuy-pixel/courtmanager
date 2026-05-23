'use server';

import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

// --- CONTRACTS & RATES ---

export async function getCoachContract(coachId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Validate coach belongs to academy
  const { data: member } = await supabase
    .from('academy_members')
    .select('id')
    .eq('id', coachId)
    .eq('academy_id', academyId)
    .single();

  if (!member) throw new Error('Coach not found');

  const { data: contract } = await supabase
    .from('coach_salary_contracts')
    .select('*')
    .eq('coach_id', coachId)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single();

  const { data: rates } = await supabase
    .from('coach_class_rates')
    .select('id, class_id, rate_amount, classes(name)')
    .eq('coach_id', coachId);

  return { contract, rates: rates || [] };
}

export async function updateCoachContract(
  coachId: string, 
  baseSalary: number, 
  effectiveFrom: string,
  rates: { classId: string, rateAmount: number }[]
) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Upsert contract (assuming we just update the latest one for simplicity or create new if not exist)
  // Real world: we might want to expire the old one and insert a new one if effectiveFrom changes
  
  // We'll just delete existing and create new for this demo
  await supabase.from('coach_salary_contracts').delete().eq('coach_id', coachId);
  
  await supabase.from('coach_salary_contracts').insert({
    coach_id: coachId,
    base_salary: baseSalary,
    effective_from: effectiveFrom
  });

  // Upsert rates
  await supabase.from('coach_class_rates').delete().eq('coach_id', coachId);
  
  if (rates.length > 0) {
    const rateInserts = rates.map(r => ({
      coach_id: coachId,
      class_id: r.classId,
      rate_amount: r.rateAmount
    }));
    await supabase.from('coach_class_rates').insert(rateInserts);
  }

  revalidatePath(`/staff/${coachId}/contract`);
  return { success: true };
}

// --- PAYROLL GENERATION ---

export async function getPayrolls(month: number, year: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const { data, error } = await supabase
    .from('payrolls')
    .select(`
      *,
      academy_members!inner(id, user_id, roles(name), profiles(full_name, avatar_url)),
      payroll_items(*)
    `)
    .eq('academy_id', academyId)
    .eq('period_start_date', startDate)
    .eq('period_end_date', endDate);

  if (error) throw new Error('Failed to fetch payrolls');
  return data || [];
}

export async function generatePayrollForMonth(month: number, year: number) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  // 1. Fetch all coaches with contracts
  const { data: contracts } = await supabase
    .from('coach_salary_contracts')
    .select('coach_id, base_salary, academy_members!inner(academy_id)');

  const academyContracts = contracts?.filter(c => (c.academy_members as any).academy_id === academyId) || [];

  if (academyContracts.length === 0) {
    return { success: true, count: 0 };
  }

  // 2. Fetch all rates for these coaches
  const { data: rates } = await supabase
    .from('coach_class_rates')
    .select('*')
    .in('coach_id', academyContracts.map(c => c.coach_id));

  // 3. Fetch attendances for these coaches in the month
  const { data: attendances } = await supabase
    .from('attendances')
    .select('id, schedule_id, class_id, marked_by, date')
    .eq('academy_id', academyId)
    .gte('date', startDate)
    .lte('date', endDate)
    .not('marked_by', 'is', null);

  let generatedCount = 0;

  for (const contract of academyContracts) {
    const coachId = contract.coach_id;
    
    // Check if payroll already exists
    const { data: existing } = await supabase
      .from('payrolls')
      .select('id, status')
      .eq('coach_id', coachId)
      .eq('period_start_date', startDate)
      .eq('period_end_date', endDate)
      .single();

    if (existing && existing.status === 'paid') {
      continue; // Skip paid payrolls
    }

    if (existing) {
      // Delete old draft items
      await supabase.from('payroll_items').delete().eq('payroll_id', existing.id);
      await supabase.from('payrolls').delete().eq('id', existing.id);
    }

    // Calculate items
    const items = [];
    let totalEarnings = 0;

    // A. Base Salary
    if (contract.base_salary > 0) {
      items.push({
        item_type: 'BASE_SALARY',
        amount: contract.base_salary,
        description: `Lương cứng tháng ${month}/${year}`
      });
      totalEarnings += Number(contract.base_salary);
    }

    // B. Session Fees
    // Find unique sessions marked by this coach
    // Since a coach marks attendance for multiple students in a session, we just group by schedule_id + date
    const coachAttendances = attendances?.filter(a => a.marked_by === coachId) || [];
    const uniqueSessions = new Map<string, any>(); // key: schedule_id_date
    
    coachAttendances.forEach(att => {
      const key = `${att.schedule_id}_${att.date}`;
      if (!uniqueSessions.has(key)) {
        uniqueSessions.set(key, att);
      }
    });

    const coachRates = rates?.filter(r => r.coach_id === coachId) || [];

    Array.from(uniqueSessions.values()).forEach(session => {
      // Find rate for this class
      const classRate = coachRates.find(r => r.class_id === session.class_id);
      const amount = classRate ? Number(classRate.rate_amount) : 0;

      if (amount > 0) {
        items.push({
          item_type: 'SESSION_FEE',
          reference_id: session.id, // using first attendance id as ref
          amount: amount,
          description: `Ca dạy ngày ${session.date}`
        });
        totalEarnings += amount;
      }
    });

    // Create payroll record
    const { data: newPayroll, error: pErr } = await supabase
      .from('payrolls')
      .insert({
        academy_id: academyId,
        coach_id: coachId,
        period_start_date: startDate,
        period_end_date: endDate,
        total_earnings: totalEarnings,
        total_deductions: 0,
        net_amount: totalEarnings
      })
      .select()
      .single();

    if (pErr || !newPayroll) {
      console.error('Failed to create payroll', pErr);
      continue;
    }

    // Insert items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        payroll_id: newPayroll.id
      }));
      await supabase.from('payroll_items').insert(itemsToInsert);
    }

    generatedCount++;
  }

  revalidatePath('/finance/payroll');
  return { success: true, count: generatedCount };
}

export async function markPayrollPaid(payrollId: string) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('payrolls')
    .update({ status: 'paid' })
    .eq('id', payrollId)
    .eq('academy_id', academyId);

  if (error) throw new Error('Failed to update status');

  revalidatePath('/finance/payroll');
  return { success: true };
}
