'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Shield, Brain, Users, Star, ArrowRight,
  CheckCircle, Wifi, Wind, BookOpen, Lock,
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Room Allocation', desc: 'Smart room matching based on preferences, personality, and budget using GPT-4.', color: 'text-purple-400' },
  { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade security with row-level access control and encrypted storage.', color: 'text-blue-400' },
  { icon: Users, title: 'Student Portal', desc: 'Manage bookings, fees, complaints and more from one intuitive dashboard.', color: 'text-green-400' },
  { icon: Building2, title: 'Admin Control', desc: 'Full administrative control over rooms, students, payments, and analytics.', color: 'text-orange-400' },
];

const stats = [
  { value: '500+', label: 'Students Managed' },
  { value: '120+', label: 'Rooms Available' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

const amenities = [
  { icon: Wifi, label: 'High-Speed WiFi' },
  { icon: Wind, label: 'Air Conditioning' },
  { icon: BookOpen, label: 'Study Areas' },
  { icon: Lock, label: '24/7 Security' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 5%)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">HMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-400 mb-8">
              <Brain className="w-4 h-4" />
              <span>AI-Powered Room Allocation</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Modern Hostel<br />
              <span className="gradient-text">Management System</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Streamline hostel operations with AI-driven room matching, seamless booking,
              automated fee management, and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary px-8 py-3 text-base">
                Start as Student <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="btn-ghost px-8 py-3 text-base">
                Admin Login
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete ecosystem for managing hostel operations efficiently and intelligently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass glass-hover rounded-2xl p-6"
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-10 md:p-16 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <h2 className="text-3xl font-bold text-white mb-4">Premium Amenities Included</h2>
            <p className="text-slate-400 mb-10">All rooms come with access to world-class facilities</p>
            <div className="flex flex-wrap justify-center gap-6">
              {amenities.map((a) => (
                <div key={a.label} className="flex items-center gap-2 glass rounded-full px-5 py-2">
                  <a.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">{a.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center gap-3">
              {['No paperwork required', 'Instant booking confirmation', 'AI-powered room matching'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of students already using HMS for their accommodation needs.</p>
          <Link href="/auth/signup" className="btn-primary px-10 py-4 text-base">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">HMS</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 HMS - Hostel Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
