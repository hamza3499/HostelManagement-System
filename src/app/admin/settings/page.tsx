import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StudentSettingsClient from '@/app/student/settings/StudentSettingsClient';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-slate-400 mt-1">Manage your admin profile.</p>
      </div>
      <StudentSettingsClient profile={profile} />
    </div>
  );
}
