import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FeesClient from './FeesClient';

export default async function StudentFeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: fees } = await supabase
    .from('fees')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fee Management</h1>
        <p className="text-slate-400 mt-1">View your fee records and upload payment proofs.</p>
      </div>
      <FeesClient fees={fees || []} userId={user.id} />
    </div>
  );
}
