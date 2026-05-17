import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AIRecommendClient from './AIRecommendClient';

export default async function AIRecommendPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: savedPrefs } = await supabase
    .from('ai_preferences')
    .select('*')
    .eq('student_id', user.id)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Room Recommendation</h1>
        <p className="text-slate-400 mt-1">Let our AI find the perfect room based on your preferences.</p>
      </div>
      <AIRecommendClient userId={user.id} savedPrefs={savedPrefs} />
    </div>
  );
}
