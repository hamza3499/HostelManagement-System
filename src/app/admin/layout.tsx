import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import type { Profile } from '@/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/auth/login');

  // Fetch pending counts for the sidebar badges
  const [
    { count: pendingBookings },
    { count: activeComplaints },
    { count: pendingFees },
    { count: unreadNotifs }
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).neq('complaint_status', 'resolved'),
    supabase.from('fees').select('*', { count: 'exact', head: true }).eq('payment_status', 'unpaid'),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read_status', false)
  ]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Premium Dark Gradient Mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black pointer-events-none" />
      
      <div className="relative z-10 flex h-screen">
        <Sidebar 
          profile={profile as Profile} 
          counts={{
            bookings: pendingBookings || 0,
            complaints: activeComplaints || 0,
            fees: pendingFees || 0
          }}
        />
        
        <div className="flex-1 flex flex-col h-full lg:pl-[var(--sidebar-width)] overflow-hidden">
          <Topbar profile={profile as Profile} unreadNotifs={unreadNotifs || 0} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 lg:p-10 xl:p-12 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full h-full pb-20">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
