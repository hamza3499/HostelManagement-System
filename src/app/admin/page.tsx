import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Users, BedDouble, BookOpen, MessageSquare, CreditCard,
  TrendingUp, CheckCircle, Clock, AlertCircle, DollarSign
} from 'lucide-react';
import { formatCurrency, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import AdminAnalytics from './AdminAnalytics';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [
    { count: totalStudents },
    { count: totalRooms },
    { count: occupiedRooms },
    { count: pendingComplaints },
    { data: recentBookings },
    { data: recentFees },
    { data: fees },
    { count: pendingBookingsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('availability_status', 'full'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('complaint_status', 'pending'),
    supabase.from('bookings').select('*, room:rooms(title, category), student:profiles!bookings_student_id_fkey(full_name, email)').order('created_at', { ascending: false }).limit(5),
    supabase.from('fees').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('fees').select('amount, payment_status'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
  ]);

  const totalRevenue = fees?.filter(f => f.payment_status === 'paid').reduce((s: number, f) => s + f.amount, 0) || 0;
  const pendingPayments = fees?.filter(f => f.payment_status === 'pending_verification').length || 0;

  const statCards = [
    { label: 'Total Students', value: totalStudents || 0, icon: Users, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400', border: 'border-blue-500/20', href: '/admin/students' },
    { label: 'Total Rooms', value: totalRooms || 0, icon: BedDouble, color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400', border: 'border-purple-500/20', href: '/admin/rooms' },
    { label: 'Occupied Rooms', value: occupiedRooms || 0, icon: CheckCircle, color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400', border: 'border-green-500/20', href: '/admin/rooms' },
    { label: 'Pending Complaints', value: pendingComplaints || 0, icon: MessageSquare, color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400', border: 'border-orange-500/20', href: '/admin/complaints' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400', border: 'border-emerald-500/20', href: '/admin/fees' },
    { label: 'Pending Payments', value: pendingPayments, icon: CreditCard, color: 'from-yellow-500/20 to-yellow-600/10', iconColor: 'text-yellow-400', border: 'border-yellow-500/20', href: '/admin/fees' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your hostel operations.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className={`stat-card bg-gradient-to-br ${card.color} border ${card.border} cursor-pointer`}>
              <div className="flex items-center justify-between mb-3">
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-xs text-slate-400">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AdminAnalytics fees={fees || []} />

      {/* Recent Bookings & Pending Payments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Recent Bookings
            </h2>
            <Link href="/admin/bookings" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentBookings && recentBookings.length > 0 ? recentBookings.map((b) => {
              const room = b.room as { title: string } | null;
              const student = b.student as { full_name: string } | null;
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BedDouble className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{student?.full_name || 'Student'}</div>
                    <div className="text-xs text-slate-400 truncate">{room?.title || 'Room'}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${getStatusColor(b.booking_status)}`}>
                    {getStatusLabel(b.booking_status)}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center py-6 text-slate-500 text-sm">No bookings yet</div>
            )}
          </div>
        </div>

        {/* Recent Fees */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-400" />
              Fee Activity
            </h2>
            <Link href="/admin/fees" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentFees && recentFees.length > 0 ? recentFees.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                <div>
                  <div className="text-sm font-medium text-white">{formatCurrency(f.amount)}</div>
                  <div className="text-xs text-slate-400">{formatRelativeTime(f.created_at)}</div>
                </div>
                <span className={`badge ${getStatusColor(f.payment_status)}`}>
                  {getStatusLabel(f.payment_status)}
                </span>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-500 text-sm">No fee records</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(pendingBookingsCount || 0) > 0 && (
        <div className="glass rounded-2xl p-5 border border-yellow-500/20 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-white">Pending Approvals</div>
            <div className="text-sm text-slate-400">{pendingBookingsCount} booking requests need your review</div>
          </div>
          <Link href="/admin/bookings" className="btn-primary text-sm px-4 py-2 flex-shrink-0">Review</Link>
        </div>
      )}
    </div>
  );
}
