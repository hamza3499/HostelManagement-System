import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import RoomDetailClient from './RoomDetailClient';

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: room } = await supabase.from('rooms').select('*').eq('id', id).single();
  if (!room) notFound();

  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, booking_status')
    .eq('student_id', user.id)
    .in('booking_status', ['pending', 'approved'])
    .single();

  return <RoomDetailClient room={room} userId={user.id} hasActiveBooking={!!existingBooking} />;
}
