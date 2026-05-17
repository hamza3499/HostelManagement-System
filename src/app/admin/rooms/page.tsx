import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminRoomsClient from './AdminRoomsClient';

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Rooms</h1>
        <p className="text-slate-400 mt-1">Add, edit, and manage hostel rooms.</p>
      </div>
      <AdminRoomsClient rooms={rooms || []} />
    </div>
  );
}
