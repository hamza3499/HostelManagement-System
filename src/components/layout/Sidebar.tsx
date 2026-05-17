'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, LayoutDashboard, BedDouble, BookOpen,
  MessageSquare, CreditCard, Users, BarChart3,
  Brain, Bell, LogOut, Menu, X, Settings, Sparkles
} from 'lucide-react';
import { signOut } from '@/actions/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { Profile } from '@/types';

interface SidebarProps {
  profile: Profile;
  counts?: {
    bookings?: number;
    complaints?: number;
    fees?: number;
  };
}

const studentLinks = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/rooms', icon: BedDouble, label: 'Browse Rooms' },
  { href: '/student/bookings', icon: BookOpen, label: 'My Bookings' },
  { href: '/student/complaints', icon: MessageSquare, label: 'Complaints' },
  { href: '/student/fees', icon: CreditCard, label: 'Fee Status' },
  { href: '/student/ai-recommend', icon: Brain, label: 'AI Recommend' },
  { href: '/student/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { href: '/admin', icon: BarChart3, label: 'Dashboard' },
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
  { href: '/admin/bookings', icon: BookOpen, label: 'Bookings', countKey: 'bookings' as const },
  { href: '/admin/complaints', icon: MessageSquare, label: 'Complaints', countKey: 'complaints' as const },
  { href: '/admin/fees', icon: CreditCard, label: 'Fee Records', countKey: 'fees' as const },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ profile, counts = {} }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = profile.role === 'admin' ? adminLinks : studentLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-3xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-900/60 relative overflow-hidden">
        {/* Subtle horizontal highlight line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_4px_20px_rgba(99,102,241,0.35)] animate-pulse-glow">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent flex items-center gap-1.5">
              HMS
              <Sparkles className="w-3.5 h-3.5 text-amber-450 animate-bounce" />
            </div>
            <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold capitalize">{profile.role} Panel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4 px-3">Navigation</div>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          const badgeCount = 'countKey' in link && link.countKey ? counts[link.countKey as keyof typeof counts] : 0;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'sidebar-item group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                isActive 
                  ? 'bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent text-blue-400 border border-blue-500/20 shadow-[0_10px_25px_-10px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/4 hover:translate-x-1 border border-transparent'
              )}
            >
              <link.icon className={cn('w-4.5 h-4.5 flex-shrink-0 transition-colors duration-300', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white')} />
              <span className="flex-1">{link.label}</span>
              
              {/* Dynamic Notification Badges for Admin */}
              {badgeCount ? (
                <div className="relative flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full ml-auto">
                  <span className="text-[10px] font-bold text-rose-400">{badgeCount > 99 ? '99+' : badgeCount}</span>
                </div>
              ) : isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-5 border-t border-slate-900/60 space-y-3">
        <Link 
          href={profile.role === 'admin' ? '/admin/settings' : '/student/settings'} 
          className="sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/4 transition-colors"
        >
          <Settings className="w-4.5 h-4.5" />
          Settings
        </Link>
        <button
          onClick={() => signOut()}
          className="sidebar-item w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-450 hover:text-rose-350 hover:bg-rose-500/10 transition-all duration-300"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>

        {/* Premium Resident Profile Card */}
        <div className="relative p-[1px] rounded-xl overflow-hidden mt-3 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-xl" />
          <div className="relative flex items-center gap-3 p-3 rounded-[11px] bg-slate-950/90 border border-slate-850">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-white truncate leading-none">{profile.full_name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-1 leading-none">{profile.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full border-r border-slate-900/60 z-40" style={{ width: 'var(--sidebar-width)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-950/80 border border-slate-900/60 backdrop-blur-md rounded-lg p-2 shadow-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full z-50 border-r border-slate-900/60"
              style={{ width: '260px' }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
