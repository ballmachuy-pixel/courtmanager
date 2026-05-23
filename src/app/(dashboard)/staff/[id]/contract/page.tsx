import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { getCoachContract } from '@/app/actions/payroll';
import ContractForm from '@/components/staff/ContractForm';

export default async function ContractPage({ params }: { params: { id: string } }) {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: staff } = await supabase
    .from('academy_members')
    .select('*')
    .eq('academy_id', academyId)
    .eq('id', params.id)
    .single();

  if (!staff) {
    return redirect('/staff');
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('academy_id', academyId);

  const { contract, rates } = await getCoachContract(params.id);

  return (
    <div className="animate-in pb-20">
      <ContractForm staff={staff} initialContract={contract} initialRates={rates} classes={classes || []} />
    </div>
  );
}
