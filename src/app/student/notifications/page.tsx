import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

export default async function StudentNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-1">Stay updated with your hostel activity.</p>
      </div>
      <NotificationsClient notifications={notifications || []} userId={user.id} />
    </div>
  );
}
