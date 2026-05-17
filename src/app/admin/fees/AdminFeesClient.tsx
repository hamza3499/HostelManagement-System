'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Plus, X, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Fee } from '@/types';

const schema = z.object({
  student_id: z.string().min(1, 'Select a student'),
  amount: z.coerce.number().min(1),
  due_date: z.string().min(1, 'Due date is required'),
});
type FormData = z.infer<typeof schema>;

interface EnhancedFee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  payment_status: string;
  transaction_screenshot: string | null;
  admin_verification: boolean;
  created_at: string;
  student: { full_name: string; email: string } | null;
}

interface Props {
  fees: EnhancedFee[];
  students: { id: string; full_name: string; email: string }[];
}

type FilterStatus = 'all' | 'unpaid' | 'pending_verification' | 'paid' | 'rejected';

export default function AdminFeesClient({ fees: initial, students }: Props) {
  const [fees, setFees] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const filtered = fees.filter(f => filter === 'all' || f.payment_status === filter);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: newFee, error } = await supabase
        .from('fees')
        .insert({ ...data, payment_status: 'unpaid', admin_verification: false })
        .select('*, student:profiles(full_name, email)')
        .single();
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: data.student_id,
        title: 'New Fee Record Assigned',
        message: `A new fee of ${formatCurrency(data.amount)} has been assigned. Due date: ${formatDate(data.due_date)}.`,
      });

      setFees([newFee, ...fees]);
      reset();
      setShowForm(false);
      toast.success('Fee record created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create fee');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (feeId: string, approve: boolean) => {
    setVerifying(feeId);
    try {
      const supabase = createClient();
      const newStatus = approve ? 'paid' : 'rejected';
      const { error } = await supabase
        .from('fees')
        .update({ payment_status: newStatus, admin_verification: approve })
        .eq('id', feeId);
      if (error) throw error;
      
      const targetFee = fees.find(f => f.id === feeId);
      if (targetFee) {
        await supabase.from('notifications').insert({
          user_id: targetFee.student_id,
          title: `Payment ${approve ? 'Approved' : 'Rejected'}`,
          message: `Your fee payment of ${formatCurrency(targetFee.amount)} has been ${approve ? 'approved and cleared' : 'rejected. Please upload a valid receipt'}.`,
        });
      }

      setFees(fees.map(f => f.id === feeId ? { ...f, payment_status: newStatus, admin_verification: approve } : f));
      toast.success(approve ? 'Payment approved!' : 'Payment rejected!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setVerifying(null);
    }
  };

  const counts: Record<FilterStatus, number> = {
    all: fees.length,
    unpaid: fees.filter(f => f.payment_status === 'unpaid').length,
    pending_verification: fees.filter(f => f.payment_status === 'pending_verification').length,
    paid: fees.filter(f => f.payment_status === 'paid').length,
    rejected: fees.filter(f => f.payment_status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-ghost' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Assign Fee</>}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <h2 className="font-semibold text-white mb-5">Assign Fee to Student</h2>
              <form onSubmit={handleSubmit(onSubmit as any)} className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Student</label>
                  <select {...register('student_id')} className="hms-input">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
                  </select>
                  {errors.student_id && <p className="text-red-400 text-xs mt-1">{errors.student_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (PKR)</label>
                  <input {...register('amount')} type="number" placeholder="10000" className="hms-input" />
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
                  <input {...register('due_date')} type="date" className="hms-input" />
                  {errors.due_date && <p className="text-red-400 text-xs mt-1">{errors.due_date.message}</p>}
                </div>
                <div className="md:col-span-3">
                  <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Fee Record'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'pending_verification', label: 'Pending Verification' },
          { key: 'unpaid', label: 'Unpaid' },
          { key: 'paid', label: 'Paid' },
          { key: 'rejected', label: 'Rejected' },
        ] as { key: FilterStatus; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-blue-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
          >
            {label} <span className="ml-1 opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Fees table */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium">No Fee Records Found</h3>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <div>
                        <div className="font-medium text-white text-sm">{fee.student?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{fee.student?.email}</div>
                      </div>
                    </td>
                    <td className="font-semibold text-white">{formatCurrency(fee.amount)}</td>
                    <td className="text-slate-300 text-sm">{formatDate(fee.due_date)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(fee.payment_status)}`}>{getStatusLabel(fee.payment_status)}</span>
                    </td>
                    <td>
                      {fee.transaction_screenshot ? (
                        <a href={fee.transaction_screenshot} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 text-xs hover:underline">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td>
                      {fee.payment_status === 'pending_verification' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyPayment(fee.id, true)}
                            disabled={verifying === fee.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30 transition-colors"
                          >
                            {verifying === fee.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => verifyPayment(fee.id, false)}
                            disabled={verifying === fee.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
