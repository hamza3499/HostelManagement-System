import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ComplaintsClient from './ComplaintsClient';

export default async function StudentComplaintsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Complaints</h1>
        <p className="text-slate-400 mt-1">Submit and track your complaints.</p>
      </div>
      <ComplaintsClient complaints={complaints || []} userId={user.id} />
    </div>
  );
}
