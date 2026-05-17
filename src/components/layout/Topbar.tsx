'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/types';

interface TopbarProps {
  profile: Profile;
  title?: string;
  unreadNotifs?: number;
}

export default function Topbar({ profile, title, unreadNotifs = 0 }: TopbarProps) {
  const notifHref = profile.role === 'admin' ? '/admin/notifications' : '/student/notifications';

  return (
    <header className="h-[72px] bg-slate-950/40 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 backdrop-blur-2xl">
      {/* Decorative top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div>
        {title ? (
          <h1 className="font-black text-white text-xl tracking-tight flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-400 to-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            {title}
          </h1>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 uppercase tracking-widest shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Suite HMS Active Session
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-5">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all rounded-full px-5 py-2.5 text-xs font-semibold text-slate-400 cursor-pointer shadow-inner relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="tracking-wide">Quick suite search...</span>
          <div className="flex items-center gap-1 ml-4 opacity-50">
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono">K</kbd>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800 hidden md:block" />

        {/* Notifications */}
        <Link 
          href={notifHref} 
          className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all group"
        >
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1.5 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_12px_rgba(244,63,94,0.8)] border border-rose-400/50 z-10 transform group-hover:scale-110 transition-transform">
              {unreadNotifs > 99 ? '99+' : unreadNotifs}
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <div className="relative p-[2px] rounded-full overflow-hidden shadow-lg cursor-pointer group hover:scale-105 transition-transform">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-full animate-[spin_4s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center text-white text-sm font-black tracking-tight border border-slate-800/50 z-10">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
