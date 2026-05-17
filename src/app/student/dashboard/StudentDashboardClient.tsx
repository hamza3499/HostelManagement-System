'use client';

import { motion } from 'framer-motion';
import {
  BedDouble, BookOpen, MessageSquare, CreditCard,
  Bell, CheckCircle, Clock, XCircle, TrendingUp, Sparkles, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface StudentDashboardClientProps {
  profile: any;
  bookings: any[] | null;
  fees: any[] | null;
  complaints: any[] | null;
  notifications: any[] | null;
  unreadNotifs: number;
  activeBooking: any;
  pendingFees: any[];
}

export default function StudentDashboardClient({
  profile,
  bookings,
  fees,
  complaints,
  notifications,
  unreadNotifs,
  activeBooking,
  pendingFees,
}: StudentDashboardClientProps) {

  // Premium Custom Stat Cards Layout
  const statCards = [
    {
      label: 'Current Room Suite',
      value: activeBooking ? (activeBooking.room as { title: string })?.title || 'Active Suite' : 'Suite Unallocated',
      subtitle: activeBooking ? 'Luxury Living Suite' : 'Book a luxury room now',
      icon: BedDouble,
      gradient: 'from-blue-600/10 via-indigo-600/5 to-transparent',
      hoverGlow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      href: '/student/bookings',
    },
    {
      label: 'Suite Balance',
      value: pendingFees.length > 0 ? formatCurrency(pendingFees.reduce((s, f) => s + f.amount, 0)) : 'Balance Cleared',
      subtitle: pendingFees.length > 0 ? 'Dues pending review' : 'Premium resident standing',
      icon: CreditCard,
      gradient: pendingFees.length > 0 ? 'from-rose-600/10 via-pink-600/5 to-transparent' : 'from-emerald-600/10 via-teal-600/5 to-transparent',
      hoverGlow: pendingFees.length > 0 ? 'shadow-[0_0_50px_rgba(244,63,94,0.25)]' : 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      iconBg: pendingFees.length > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      borderColor: pendingFees.length > 0 ? 'border-rose-500/20 hover:border-rose-500/50' : 'border-emerald-500/20 hover:border-emerald-500/50',
      href: '/student/fees',
    },
    {
      label: 'Concierge Tickets',
      value: complaints?.length || 0,
      subtitle: 'Active support requests',
      icon: MessageSquare,
      gradient: 'from-purple-600/10 via-fuchsia-600/5 to-transparent',
      hoverGlow: 'shadow-[0_0_50px_rgba(168,85,247,0.25)]',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
      href: '/student/complaints',
    },
    {
      label: 'Priority Broadcasts',
      value: unreadNotifs,
      subtitle: unreadNotifs > 0 ? `${unreadNotifs} urgent briefings` : 'All updates acknowledged',
      icon: Bell,
      gradient: 'from-amber-600/10 via-orange-600/5 to-transparent',
      hoverGlow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      borderColor: 'border-amber-500/20 hover:border-amber-500/50',
      href: '/student/notifications',
    },
  ];

  return (
    <div className="space-y-10 relative pb-12">
      {/* Background glow node */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Welcome Hero Banner with moving glares */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">HMS Premium Resident Portal</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Experience luxury and convenience at your fingertips.</p>
        </div>

        {/* Dynamic AI concierge button with floating sparkles */}
        <Link href="/student/ai-recommend">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-[1.5px] rounded-xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(99,102,241,0.25)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 animate-spin-slow" style={{ width: '200%', height: '200%', top: '-50%', left: '-50%' }} />
            <div className="relative flex items-center gap-2.5 bg-slate-950 px-5 py-3 rounded-[11px] text-white">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-300">Consult AI Concierge</div>
                <div className="text-[10px] text-indigo-400 font-medium">Smart Room Recommendations</div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 ml-1.5" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Interactive 3D Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Link key={card.label} href={card.href} className="block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ 
                rotateX: 2, 
                rotateY: -2, 
                y: -6,
                transition: { duration: 0.3 }
              }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              className={`relative h-full bg-slate-950/60 backdrop-blur-xl border ${card.borderColor} rounded-2xl p-6 transition-all duration-300 group shadow-[0_15px_35px_rgba(0,0,0,0.5)]`}
            >
              {/* Inner ambient glow sheet */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-300`} />
              
              {/* Shiny glass overlay indicator */}
              <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-100 group-hover:border-white/10 transition-colors" />

              <div className="relative z-10 flex flex-col justify-between h-full" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-650 group-hover:text-slate-350 transition-colors" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.label}</div>
                  <div className="text-2xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors truncate">{card.value}</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{card.subtitle}</div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Luxury Content Console */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Bookings Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 relative bg-slate-950/70 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Edge flare glare line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
              </div>
              Recent Suite Bookings
            </h2>
            <Link href="/student/bookings" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors">
              View Premium History
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {bookings && bookings.length > 0 ? bookings.map((booking, index) => (
              <motion.div 
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 hover:bg-slate-900/70 hover:border-slate-800 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <BedDouble className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{(booking.room as { title: string })?.title || 'Suite Request'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{formatDate(booking.booking_date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge py-1.5 px-3 rounded-lg font-bold text-[11px] shadow-sm uppercase tracking-wider ${
                    booking.booking_status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                      : booking.booking_status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5 animate-pulse'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5'
                  }`}>
                    {getStatusLabel(booking.booking_status)}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                <BedDouble className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold text-sm">No suites booked yet</p>
                <p className="text-slate-600 text-xs mt-1 mb-5">Embark on high-end residency living by requesting your suite today.</p>
                <Link href="/student/rooms" className="btn-luxury py-2.5 px-6 rounded-lg text-xs font-bold shadow-lg">
                  Browse Premium Suites
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Fee Status Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-slate-950/70 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Edge flare glare line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <CreditCard className="w-4.5 h-4.5 text-green-400" />
              </div>
              Financial Standing
            </h2>
            <Link href="/student/fees" className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-bold transition-colors">
              Ledger
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {fees && fees.length > 0 ? fees.slice(0, 4).map((fee, index) => (
              <motion.div 
                key={fee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 hover:bg-slate-900/70 hover:border-slate-800 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-base font-black text-white tracking-tight">{formatCurrency(fee.amount)}</span>
                  <span className={`badge py-1 px-2.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                    fee.payment_status === 'paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                  }`}>
                    {getStatusLabel(fee.payment_status)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Due Date: {formatDate(fee.due_date)}</div>
              </motion.div>
            )) : (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-emerald-500/20 mb-2.5" />
                <p className="text-slate-300 font-bold text-sm">Perfect Standing</p>
                <p className="text-slate-500 text-xs mt-1 text-center px-4">All accounts are fully paid and synchronized. Thank you!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Support Concierge Tickets List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-slate-950/70 border border-slate-800/80 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
            </div>
            Active Concierge Tickets
          </h2>
          <Link href="/student/complaints" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">
            File New Ticket
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {complaints && complaints.length > 0 ? complaints.map((c, index) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-900/60 hover:bg-slate-900/70 hover:border-slate-800 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="min-w-0">
                <div className="font-bold text-white text-sm truncate">{c.title}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1 pr-6">{c.description}</div>
              </div>
              <span className={`badge ml-4 flex-shrink-0 flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-[11px] uppercase tracking-wider ${
                c.complaint_status === 'resolved' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : c.complaint_status === 'in_progress'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {c.complaint_status === 'in_progress' ? <Clock className="w-3 h-3" /> : c.complaint_status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {getStatusLabel(c.complaint_status)}
              </span>
            </motion.div>
          )) : (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500/20 mb-2.5 animate-bounce" />
              <p className="text-slate-300 font-bold text-sm">Perfect Living Conditions</p>
              <p className="text-slate-500 text-xs mt-1 text-center px-4">No complains filed. Everything is running in flawless comfort.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Luxury Priority Broadcast System */}
      {notifications && notifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative bg-slate-950/80 border border-amber-500/20 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_20px_50px_rgba(245,158,11,0.05)] overflow-hidden"
        >
          {/* Gold highlight border top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-pulse">
              <Bell className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Unread Priority Broadcasts
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Official HMS administration alerts</p>
            </div>
            <span className="badge ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30 py-1 px-3 rounded-full font-bold text-xs">{unreadNotifs}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-slate-900/30 border border-slate-900/60 hover:bg-slate-900/40 transition-colors shadow-sm flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white text-sm line-clamp-1">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{n.message}</div>
                </div>
                <div className="text-[10px] text-slate-550 font-bold uppercase tracking-wider mt-3">{formatDate(n.created_at)}</div>
              </div>
            ))}
          </div>

          <Link href="/student/notifications" className="block text-center mt-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="py-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Acknowledge & View All Broadcasts
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
