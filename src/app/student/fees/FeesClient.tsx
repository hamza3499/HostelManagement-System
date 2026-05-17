'use client';

import { useState } from 'react';
import { CreditCard, Upload, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Fee } from '@/types';
import { uploadFeeProofAction } from '@/actions/fees';

interface Props {
  fees: Fee[];
  userId: string;
}

export default function FeesClient({ fees: initial, userId }: Props) {
  const [fees, setFees] = useState(initial);
  const [uploading, setUploading] = useState<string | null>(null);

  const totalPending = fees.filter(f => f.payment_status === 'unpaid' || f.payment_status === 'rejected').reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.filter(f => f.payment_status === 'paid').reduce((s, f) => s + f.amount, 0);

  const handleUpload = async (feeId: string, file: File) => {
    setUploading(feeId);
    try {
      const reader = new FileReader();
      
      const uploadPromise = new Promise<{ publicUrl: string }>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const res = await uploadFeeProofAction(feeId, base64Data, file.name);
            if (res.error) {
              reject(new Error(res.error));
            } else if (res.publicUrl) {
              resolve({ publicUrl: res.publicUrl });
            } else {
              reject(new Error('Failed to upload proof. Please try again.'));
            }
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      const { publicUrl } = await uploadPromise;

      setFees(fees.map(f => f.id === feeId
        ? { ...f, transaction_screenshot: publicUrl, payment_status: 'pending_verification' }
        : f
      ));
      toast.success('Payment proof uploaded! Waiting for admin verification.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const statusIcon = {
    unpaid: XCircle,
    pending_verification: Clock,
    paid: CheckCircle,
    rejected: AlertCircle,
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
          <div className="text-sm text-slate-400 mb-1">Total Pending</div>
          <div className="text-2xl font-bold text-red-400">{formatCurrency(totalPending)}</div>
        </div>
        <div className="stat-card bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <div className="text-sm text-slate-400 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {/* Fees list */}
      {fees.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Fee Records</h3>
          <p className="text-slate-400 text-sm">No fees have been assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => {
            const Icon = statusIcon[fee.payment_status] || AlertCircle;
            const canUpload = fee.payment_status === 'unpaid' || fee.payment_status === 'rejected';
            return (
              <div key={fee.id} className="glass glass-hover rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-xl font-bold text-white">{formatCurrency(fee.amount)}</span>
                      <span className={`badge ${getStatusColor(fee.payment_status)}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {getStatusLabel(fee.payment_status)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">Due: {formatDate(fee.due_date)}</div>
                    {fee.payment_status === 'rejected' && (
                      <p className="text-xs text-red-400 mt-1">Payment was rejected. Please re-upload.</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {canUpload && (
                      <label className={`btn-primary text-sm px-4 py-2 cursor-pointer ${uploading === fee.id ? 'opacity-70' : ''}`}>
                        {uploading === fee.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Upload className="w-4 h-4" /> Upload Proof</>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={!!uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(fee.id, file);
                          }}
                        />
                      </label>
                    )}
                    {fee.transaction_screenshot && (
                      <a href={fee.transaction_screenshot} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm px-4 py-2 ml-2 inline-flex items-center gap-1">
                        View Receipt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
