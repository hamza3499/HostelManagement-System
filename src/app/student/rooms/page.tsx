import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RoomsClient from '@/app/student/rooms/RoomsClient';

export default async function RoomsPage() {
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
        <h1 className="text-2xl font-bold text-white">Browse Rooms</h1>
        <p className="text-slate-400 mt-1">Find the perfect room that matches your needs.</p>
      </div>
      <RoomsClient rooms={rooms || []} />
    </div>
  );
}
