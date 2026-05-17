import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminComplaintsClient from './AdminComplaintsClient';

export default async function AdminComplaintsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, student:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Complaints</h1>
        <p className="text-slate-400 mt-1">Review, respond to, and resolve student complaints.</p>
      </div>
      <AdminComplaintsClient complaints={complaints || []} />
    </div>
  );
}
