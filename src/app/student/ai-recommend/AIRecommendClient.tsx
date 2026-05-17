'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Loader2, Sparkles, BedDouble, CheckCircle,
  AlertTriangle, Star, ArrowRight, Wifi, Wind
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import type { Room, AIPreferences } from '@/types';
import Link from 'next/link';

const schema = z.object({
  budget: z.coerce.number().min(1000, 'Budget must be at least PKR 1,000'),
  preferred_room_type: z.enum(['Private Room', '2 Bed Room', '3 Bed Room', '']).optional(),
  ac_required: z.boolean(),
  quiet_environment: z.boolean(),
  smoking_preference: z.boolean(),
  study_preference: z.boolean(),
  personality_type: z.enum(['introvert', 'extrovert', 'ambivert', '']).optional(),
  floor_preference: z.coerce.number().optional(),
  special_notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Recommendation {
  room: Room;
  compatibility_score: number;
  reasons: string[];
  warnings: string[];
}

interface Props {
  userId: string;
  savedPrefs: AIPreferences | null;
}

export default function AIRecommendClient({ userId, savedPrefs }: Props) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      budget: savedPrefs?.budget || 10000,
      preferred_room_type: (savedPrefs?.preferred_room_type as FormData['preferred_room_type']) || '',
      ac_required: savedPrefs?.ac_required ?? false,
      quiet_environment: savedPrefs?.quiet_environment ?? true,
      smoking_preference: savedPrefs?.smoking_preference ?? false,
      study_preference: savedPrefs?.study_preference ?? true,
      personality_type: (savedPrefs?.personality_type as FormData['personality_type']) || '',
      floor_preference: savedPrefs?.floor_preference || undefined,
      special_notes: savedPrefs?.special_notes || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setRecommendation(null);
    try {
      const response = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, student_id: userId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get recommendation');
      }

      const result = await response.json();
      setRecommendation(result);
      toast.success('AI recommendation generated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'AI service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Room Preferences</h2>
            <p className="text-slate-400 text-sm">Tell us about yourself for the best match</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Monthly Budget (PKR)</label>
              <input
                {...register('budget')}
                type="number"
                placeholder="10000"
                className="hms-input"
              />
              {errors.budget && <p className="text-red-400 text-xs mt-1">{errors.budget.message}</p>}
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Preferred Room Type</label>
              <select {...register('preferred_room_type')} className="hms-input">
                <option value="">No Preference</option>
                <option value="Private Room">Private Room</option>
                <option value="2 Bed Room">2 Bed Room</option>
                <option value="3 Bed Room">3 Bed Room</option>
              </select>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Personality Type</label>
              <select {...register('personality_type')} className="hms-input">
                <option value="">Not Sure</option>
                <option value="introvert">Introvert — Prefer quiet & privacy</option>
                <option value="extrovert">Extrovert — Love socializing</option>
                <option value="ambivert">Ambivert — Mix of both</option>
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Floor Preference</label>
              <select {...register('floor_preference')} className="hms-input">
                <option value="">No Preference</option>
                {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Floor {f}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Preferences</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'ac_required' as const, label: 'AC Required', desc: 'Need air conditioning' },
                { name: 'quiet_environment' as const, label: 'Quiet Environment', desc: 'Prefer peaceful surroundings' },
                { name: 'study_preference' as const, label: 'Study Focused', desc: 'Priority on study environment' },
                { name: 'smoking_preference' as const, label: 'Smoking OK', desc: 'Fine with smoking roommates' },
              ].map((pref) => (
                <label key={pref.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 cursor-pointer hover:bg-white/5">
                  <input
                    {...register(pref.name)}
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{pref.label}</div>
                    <div className="text-xs text-slate-400">{pref.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Special Notes (optional)</label>
            <textarea
              {...register('special_notes')}
              rows={3}
              placeholder="Any specific requirements or preferences..."
              className="hms-input resize-none"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing preferences...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Get AI Recommendation</>
            )}
          </button>
        </form>
      </div>

      {/* Recommendation Result */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-white">AI Recommended Room</h2>
              <div className="ml-auto flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{recommendation.compatibility_score}%</span>
                <span className="text-slate-400 text-sm">match</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Room preview */}
              <div className="flex-1 glass rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-32 rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center mb-4">
                  <BedDouble className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="font-semibold text-white mb-1">{recommendation.room.title}</h3>
                <p className="text-blue-400 text-sm mb-2">{recommendation.room.category}</p>
                <div className="text-2xl font-bold text-white mb-3">{formatCurrency(recommendation.room.price)}<span className="text-slate-400 text-sm font-normal">/mo</span></div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {recommendation.room.facilities?.slice(0, 3).map(f => (
                    <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
                      {f === 'WiFi' ? <Wifi className="w-3 h-3" /> : f === 'AC' ? <Wind className="w-3 h-3" /> : null}
                      {f}
                    </span>
                  ))}
                </div>
                <Link href={`/student/rooms/${recommendation.room.id}`} className="btn-primary w-full text-center text-sm py-2 inline-flex justify-center">
                  View Room <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Analysis */}
              <div className="flex-1 space-y-4">
                {recommendation.reasons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Why This Room?</h4>
                    <ul className="space-y-2">
                      {recommendation.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendation.warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Things to Note</h4>
                    <ul className="space-y-2">
                      {recommendation.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
