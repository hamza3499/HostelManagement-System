import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminFeesClient from './AdminFeesClient';

export default async function AdminFeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: fees }, { data: students }] = await Promise.all([
    supabase.from('fees').select('*, student:profiles(full_name, email)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email').eq('role', 'student'),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fee Management</h1>
        <p className="text-slate-400 mt-1">Assign fees, verify payments, and manage records.</p>
      </div>
      <AdminFeesClient fees={fees || []} students={students || []} />
    </div>
  );
}
