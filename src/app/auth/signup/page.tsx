'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Building2, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { signUp } from '@/actions/auth';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signUp({ 
        full_name: data.fullName, 
        email: data.email, 
        password: data.password 
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Access requested! Please check your email.');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 selection:bg-indigo-500/30">
      {/* Luxury Animated Gradient Mesh Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-black pointer-events-none" />
      
      {/* Floating Glowing Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 -left-32 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" 
      />

      {/* 3D Perspective Container */}
      <div className="relative z-10 w-full max-w-[420px]" style={{ perspective: '2000px' }}>
        <motion.div
          initial={{ opacity: 0, rotateX: 15, y: 50 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ 
            rotateX: 2, 
            rotateY: -2,
            transition: { duration: 0.4, ease: "easeOut" } 
          }}
          className="relative bg-slate-950/60 backdrop-blur-3xl border border-slate-800/80 rounded-[2rem] p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] group overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Animated Edge Glare */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          {/* Logo Assembly */}
          <div className="text-center mb-8" style={{ transform: 'translateZ(40px)' }}>
            <motion.div 
              whileHover={{ scale: 1.05, rotateZ: -5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-600 p-[2px] mx-auto mb-5 shadow-[0_0_30px_rgba(147,51,234,0.4)] relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-md rounded-2xl" />
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative z-10">
                <Building2 className="w-7 h-7 text-purple-400" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              Join Residency
            </h1>
            <p className="text-slate-400 text-sm font-medium">Request premium suite access</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" style={{ transform: 'translateZ(30px)' }}>
            
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 pl-1">
                Full Name
              </label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center bg-slate-900/50 border border-slate-800 rounded-xl transition-all duration-300 group-focus-within/input:border-purple-500/50 group-focus-within/input:bg-slate-900/80 shadow-inner">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-transparent border-none text-white placeholder-slate-600 text-sm py-4 pr-4 outline-none focus:ring-0"
                  />
                </div>
              </div>
              <AnimatePresence>
                {errors.fullName && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-rose-400 text-[11px] font-bold mt-1.5 pl-1">{errors.fullName.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 pl-1">
                Email Address
              </label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center bg-slate-900/50 border border-slate-800 rounded-xl transition-all duration-300 group-focus-within/input:border-purple-500/50 group-focus-within/input:bg-slate-900/80 shadow-inner">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="resident@suite.com"
                    className="w-full bg-transparent border-none text-white placeholder-slate-600 text-sm py-4 pr-4 outline-none focus:ring-0"
                  />
                </div>
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-rose-400 text-[11px] font-bold mt-1.5 pl-1">{errors.email.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 pl-1">
                Secure Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center bg-slate-900/50 border border-slate-800 rounded-xl transition-all duration-300 group-focus-within/input:border-purple-500/50 group-focus-within/input:bg-slate-900/80 shadow-inner">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Lock className="w-4.5 h-4.5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none text-white placeholder-slate-600 text-sm py-4 pr-12 outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-rose-400 text-[11px] font-bold mt-1.5 pl-1">{errors.password.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="relative w-full py-4 mt-2 rounded-xl font-bold text-white shadow-[0_10px_20px_rgba(147,51,234,0.3)] group/btn overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transition-transform duration-500 group-hover/btn:scale-105" />
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Request Residency
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 text-center" style={{ transform: 'translateZ(20px)' }}>
            <p className="text-xs font-semibold text-slate-500">
              Already have suite access?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 hover:underline underline-offset-4 transition-all">
                Enter portal
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
