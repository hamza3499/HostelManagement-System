'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { profile: Profile | null }

export default function StudentSettingsClient({ profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').update(data).eq('id', profile?.id);
      if (error) throw error;
      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 relative">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Profile Header Card */}
      <div className="glass rounded-3xl p-8 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-40 animate-pulse" />
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl relative border-2 border-white/20 transform group-hover:scale-105 transition-transform duration-500">
              {profile?.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
              {profile?.full_name}
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-slate-400 font-medium">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> {profile?.email}</span>
              <span className="hidden sm:block text-slate-700">•</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /> <span className="capitalize text-blue-400">{profile?.role}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="md:col-span-2 glass rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
          
          <h3 className="font-bold text-white text-xl mb-8 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            Personal Information
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input {...register('full_name')} className="hms-input pl-12 h-14 text-base rounded-xl bg-slate-950/50 border-slate-800 focus:border-blue-500/50" />
                  </div>
                </div>
                {errors.full_name && <p className="text-red-400 text-xs mt-2 ml-1 font-medium">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input value={profile?.email || ''} disabled className="hms-input pl-12 h-14 text-base rounded-xl bg-slate-900/40 border-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600 mt-2 ml-1">Secure · Cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <input {...register('phone')} type="tel" placeholder="+92 300 0000000" className="hms-input pl-12 h-14 text-base rounded-xl bg-slate-950/50 border-slate-800 focus:border-purple-500/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="relative overflow-hidden group rounded-xl p-[1px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-xy" />
                <div className="relative bg-slate-950 px-8 py-3.5 rounded-xl transition-all duration-300 group-hover:bg-opacity-0">
                  <div className="flex items-center gap-2 font-bold text-white tracking-wide">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     saved ? <><CheckCircle className="w-5 h-5" /> Saved Successfully</> : 'Save Profile Changes'}
                  </div>
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden">
            <h3 className="font-bold text-white text-lg mb-6 tracking-tight">Security Details</h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Access Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                  <p className="text-slate-200 font-medium capitalize">{profile?.role} Account</p>
                </div>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Member Since</p>
                <p className="text-slate-300 font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">System ID</p>
                <p className="text-slate-400 font-mono text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                  {profile?.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
