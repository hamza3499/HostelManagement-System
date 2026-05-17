'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble, ArrowLeft, CheckCircle, XCircle, Wifi, Wind,
  BookOpen, Loader2, Star, Users
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Room } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  room: Room;
  userId: string;
  hasActiveBooking: boolean;
}

export default function RoomDetailClient({ room, userId, hasActiveBooking }: Props) {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const isAvailable = room.availability_status === 'available' && room.occupied_beds < room.total_beds;
  const occupancyPct = room.total_beds > 0 ? (room.occupied_beds / room.total_beds) * 100 : 0;

  const handleBook = async () => {
    if (hasActiveBooking) {
      toast.error('You already have an active booking. Cancel it first.');
      return;
    }
    if (room.occupied_beds >= room.total_beds) {
      toast.error('This room is already fully occupied!');
      return;
    }
    setBooking(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('bookings').insert({
        student_id: userId,
        room_id: room.id,
        booking_status: 'pending',
        booking_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      setBooked(true);
      toast.success('Booking request submitted! Admin will approve shortly.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to book room');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/student/rooms" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Rooms
      </Link>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 relative">
          {room.images && room.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BedDouble className="w-20 h-20 text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className={`badge ${getStatusColor(room.availability_status)} mb-2`}>
              {isAvailable ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              {getStatusLabel(room.availability_status)}
            </span>
            <h1 className="text-2xl font-bold text-white">{room.title}</h1>
            <p className="text-blue-400 text-sm mt-1">{room.category} • Floor {room.floor}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Details */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="font-semibold text-white mb-2">About This Room</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{room.description}</p>
              </div>

              {/* Facilities */}
              <div>
                <h2 className="font-semibold text-white mb-3">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {room.facilities?.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-sm border border-white/10">
                      {f === 'WiFi' ? <Wifi className="w-3.5 h-3.5 text-blue-400" /> :
                       f === 'AC' ? <Wind className="w-3.5 h-3.5 text-blue-400" /> :
                       <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Occupancy */}
              <div>
                <h2 className="font-semibold text-white mb-3">Occupancy</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Beds filled</span>
                      <span className="text-white">{room.occupied_beds}/{room.total_beds}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${occupancyPct >= 100 ? 'bg-red-500' : occupancyPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking card */}
            <div id="book" className="glass rounded-xl p-5 h-fit space-y-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{formatCurrency(room.price)}</div>
                <div className="text-slate-400 text-sm">per month</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-slate-200">{room.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Floor</span>
                  <span className="text-slate-200">{room.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Beds</span>
                  <span className="text-slate-200">{room.total_beds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available</span>
                  <span className="text-slate-200">{room.total_beds - room.occupied_beds}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                {booked ? (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 text-sm font-medium">Booking Submitted!</p>
                    <p className="text-slate-400 text-xs mt-1">Awaiting admin approval</p>
                  </div>
                ) : (
                  <button
                    onClick={handleBook}
                    disabled={!isAvailable || booking || hasActiveBooking}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     hasActiveBooking ? 'Already Booked' :
                     !isAvailable ? 'Not Available' : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        Book This Room
                      </>
                    )}
                  </button>
                )}
                {hasActiveBooking && !booked && (
                  <p className="text-xs text-slate-500 text-center mt-2">You have an active booking</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
