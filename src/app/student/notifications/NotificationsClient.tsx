'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Notification } from '@/types';

interface Props {
  notifications: Notification[];
  userId: string;
}

export default function NotificationsClient({ notifications: initial, userId }: Props) {
  const [notifications, setNotifications] = useState(initial);
  const [loading, setLoading] = useState(false);

  const markAllRead = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('notifications').update({ read_status: true }).eq('user_id', userId).eq('read_status', false);
    setNotifications(notifications.map(n => ({ ...n, read_status: true })));
    setLoading(false);
    toast.success('All notifications marked as read');
  };

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ read_status: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header actions */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30">{unreadCount} unread</span>
          <button onClick={markAllRead} disabled={loading} className="btn-ghost text-sm px-3 py-2 flex items-center gap-1.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Notifications</h3>
          <p className="text-slate-400 text-sm">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read_status && markRead(notif.id)}
              className={`glass rounded-xl p-4 cursor-pointer transition-all hover:bg-white/6 ${
                !notif.read_status ? 'border-l-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.read_status ? 'bg-slate-700' : 'bg-blue-500/20'
                }`}>
                  <Bell className={`w-4 h-4 ${notif.read_status ? 'text-slate-500' : 'text-blue-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium text-sm ${notif.read_status ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </p>
                    {!notif.read_status && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-slate-600 mt-2">{formatRelativeTime(notif.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
