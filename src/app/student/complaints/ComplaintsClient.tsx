'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, X, Loader2, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Complaint } from '@/types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  complaints: Complaint[];
  userId: string;
}

export default function ComplaintsClient({ complaints: initial, userId }: Props) {
  const [complaints, setComplaints] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(path, imageFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('complaint-images').getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const { data: complaint, error } = await supabase
        .from('complaints')
        .insert({ ...data, student_id: userId, image_url: imageUrl, complaint_status: 'pending' })
        .select()
        .single();

      if (error) throw error;
      setComplaints([complaint, ...complaints]);
      setShowForm(false);
      reset();
      setImageFile(null);
      toast.success('Complaint submitted successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = { pending: AlertCircle, in_progress: Clock, resolved: CheckCircle };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-ghost' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Complaint</>}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Submit New Complaint
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                  <input {...register('title')} placeholder="Brief description of the issue" className="hms-input" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Provide detailed information about the issue..."
                    className="hms-input resize-none"
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Image (optional)</label>
                  <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => document.getElementById('complaint-img')?.click()}>
                    <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                    <p className="text-sm text-slate-400">{imageFile ? imageFile.name : 'Click to upload an image'}</p>
                    <input
                      id="complaint-img"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Complaint'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaints list */}
      {complaints.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Complaints</h3>
          <p className="text-slate-400 text-sm">Everything seems fine! Submit a complaint if you have any issues.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const Icon = statusIcon[complaint.complaint_status] || AlertCircle;
            return (
              <div key={complaint.id} className="glass glass-hover rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{complaint.title}</h3>
                      <p className="text-xs text-slate-500">{formatRelativeTime(complaint.created_at)}</p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${getStatusColor(complaint.complaint_status)}`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {getStatusLabel(complaint.complaint_status)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed ml-13">{complaint.description}</p>
                {complaint.admin_response && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <p className="text-xs text-blue-400 font-medium mb-1">Admin Response:</p>
                    <p className="text-sm text-slate-300">{complaint.admin_response}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
