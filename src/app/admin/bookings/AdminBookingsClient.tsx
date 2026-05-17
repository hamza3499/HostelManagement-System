'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, Loader2, BedDouble, User } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Booking } from '@/types';

interface EnhancedBooking {
  id: string;
  student_id: string;
  room_id: string;
  booking_status: import('@/types').BookingStatus;
  booking_date: string;
  approved_by: string | null;
  created_at: string;
  room: { title: string; category: string; price: number; floor: number } | null;
  student: { full_name: string; email: string; phone: string | null } | null;
}

interface RoomOption {
  id: string;
  title: string;
  category: string;
  price: number;
  floor: number;
  availability_status: string;
}

interface Props {
  bookings: EnhancedBooking[];
  rooms: RoomOption[];
  adminId: string;
}

type FilterStatus = 'all' | 'pending' | 'approved';

export default function AdminBookingsClient({ bookings: initial, rooms, adminId }: Props) {
  const [bookings, setBookings] = useState(initial.filter(b => b.booking_status !== 'rejected' && b.booking_status !== 'cancelled'));
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [changingRoom, setChangingRoom] = useState<string | null>(null);
  const [newRoomId, setNewRoomId] = useState<string>('');

  const filtered = bookings.filter(b => filter === 'all' || b.booking_status === filter);

  const updateStatus = async (bookingId: string, newStatus: import('@/types').BookingStatus) => {
    setUpdating(bookingId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: newStatus,
          ...(newStatus === 'approved' || newStatus === 'rejected' ? { approved_by: adminId } : {})
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      const targetBooking = bookings.find(b => b.id === bookingId);
      if (targetBooking && newStatus === 'rejected') {
        await supabase.from('notifications').insert({
          user_id: targetBooking.student_id,
          title: 'Booking Rejected',
          message: 'Your room suite booking request has been rejected.',
        });
      } else if (targetBooking && newStatus === 'cancelled') {
        await supabase.from('notifications').insert({
          user_id: targetBooking.student_id,
          title: 'Booking Cancelled',
          message: 'Your room booking has been cancelled by the administration.',
        });
      }

      if (newStatus === 'rejected' || newStatus === 'cancelled') {
        setBookings(bookings.filter(b => b.id !== bookingId));
      } else {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));
      }
      toast.success(`Booking ${newStatus} successfully!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const reassignRoom = async (bookingId: string) => {
    if (!newRoomId) return;
    setUpdating(bookingId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bookings')
        .update({ room_id: newRoomId })
        .eq('id', bookingId);

      if (error) throw error;
      
      const newRoom = rooms.find(r => r.id === newRoomId);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, room_id: newRoomId, room: newRoom as unknown as RoomOption } : b));
      setChangingRoom(null);
      setNewRoomId('');
      toast.success('Room reassigned successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reassignment failed');
    } finally {
      setUpdating(null);
    }
  };

  const filterCounts: Record<FilterStatus, number> = {
    all: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    approved: bookings.filter(b => b.booking_status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-70">({filterCounts[f] || 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Bookings Found</h3>
          <p className="text-slate-400 text-sm">No booking requests match this filter.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {booking.student?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{booking.student?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-slate-400">{booking.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-white text-sm">{booking.room?.title || 'Room'}</div>
                        <div className="text-xs text-slate-400">{booking.room?.category} • Floor {booking.room?.floor} • {formatCurrency(booking.room?.price || 0)}/mo</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-slate-300">{formatDate(booking.booking_date)}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(booking.booking_status)}`}>
                        {getStatusLabel(booking.booking_status)}
                      </span>
                    </td>
                    <td>
                      {booking.booking_status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, 'approved')}
                            disabled={!!updating}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          >
                            {updating === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'rejected')}
                            disabled={!!updating}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.booking_status === 'approved' && (
                        <div className="flex gap-2">
                          {changingRoom === booking.id ? (
                            <div className="flex gap-1 items-center bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
                              <select 
                                value={newRoomId} 
                                onChange={e => setNewRoomId(e.target.value)}
                                className="bg-slate-950 text-white text-xs rounded border border-slate-700 px-2 py-1 outline-none"
                              >
                                <option value="">Select a Room</option>
                                {rooms.filter(r => r.availability_status !== 'full' || r.id === booking.room_id).map(r => (
                                  <option key={r.id} value={r.id}>{r.title} (Floor {r.floor})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => reassignRoom(booking.id)}
                                disabled={!!updating || !newRoomId}
                                className="flex items-center justify-center w-7 h-7 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
                              >
                                {updating === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => setChangingRoom(null)}
                                className="flex items-center justify-center w-7 h-7 rounded bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setChangingRoom(booking.id)}
                                disabled={!!updating}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                              >
                                Change Room
                              </button>
                              <button
                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                disabled={!!updating}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/30 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
