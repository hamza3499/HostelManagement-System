import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminStudentsClient from './AdminStudentsClient';

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Students</h1>
        <p className="text-slate-400 mt-1">View and manage all registered students.</p>
      </div>
      <AdminStudentsClient students={students || []} />
    </div>
  );
}
