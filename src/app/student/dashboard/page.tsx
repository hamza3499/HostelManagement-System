import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StudentDashboardClient from './StudentDashboardClient';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [
    { data: profile },
    { data: bookings },
    { data: fees },
    { data: complaints },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('bookings').select('*, room:rooms(*)').eq('student_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('fees').select('*').eq('student_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('complaints').select('*').eq('student_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('notifications').select('*').eq('user_id', user.id).eq('read_status', false).limit(5),
  ]);

  const activeBooking = bookings?.find(b => b.booking_status === 'approved');
  const pendingFees = fees?.filter(f => f.payment_status === 'unpaid' || f.payment_status === 'rejected') || [];
  const unreadNotifs = notifications?.length || 0;

  return (
    <StudentDashboardClient
      profile={profile}
      bookings={bookings}
      fees={fees}
      complaints={complaints}
      notifications={notifications}
      unreadNotifs={unreadNotifs}
      activeBooking={activeBooking}
      pendingFees={pendingFees}
    />
  );
}
