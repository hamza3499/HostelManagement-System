import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import { BookOpen, BedDouble, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function StudentBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, room:rooms(*)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-slate-400 mt-1">Track all your room booking requests.</p>
        </div>
        <Link href="/student/rooms" className="btn-primary text-sm px-4 py-2">Browse Rooms</Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <BedDouble className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Bookings Yet</h3>
          <p className="text-slate-400 text-sm mb-6">You haven&apos;t booked any rooms yet.</p>
          <Link href="/student/rooms" className="btn-primary px-6 py-2.5 text-sm inline-flex">Browse Available Rooms</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const room = booking.room as { title: string; category: string; price: number; floor: number } | null;
            return (
              <div key={booking.id} className="glass glass-hover rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <BedDouble className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{room?.title || 'Room'}</h3>
                    <span className={`badge ${getStatusColor(booking.booking_status)}`}>
                      {getStatusLabel(booking.booking_status)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {room?.category} • Floor {room?.floor} • {formatCurrency(room?.price || 0)}/month
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Requested on {formatDate(booking.created_at)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {booking.booking_status === 'approved' && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
