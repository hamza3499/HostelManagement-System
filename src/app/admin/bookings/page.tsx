import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminBookingsClient from '@/app/admin/bookings/AdminBookingsClient';

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, room:rooms(title, category, price, floor), student:profiles!bookings_student_id_fkey(full_name, email, phone)')
    .order('created_at', { ascending: false });

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, title, category, price, floor, availability_status')
    .order('title', { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
        <p className="text-slate-400 mt-1">Review and approve student room booking requests.</p>
      </div>
      <AdminBookingsClient bookings={bookings || []} rooms={rooms || []} adminId={user.id} />
    </div>
  );
}
