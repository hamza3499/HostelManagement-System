'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, Send, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Complaint, ComplaintStatus } from '@/types';

interface EnhancedComplaint {
  id: string;
  student_id: string;
  title: string;
  description: string;
  image_url: string | null;
  complaint_status: ComplaintStatus;
  admin_response: string | null;
  created_at: string;
  student: { full_name: string; email: string } | null;
}

interface Props { complaints: EnhancedComplaint[] }

type FilterStatus = 'all' | ComplaintStatus;

export default function AdminComplaintsClient({ complaints: initial }: Props) {
  const [complaints, setComplaints] = useState(initial);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [expanding, setExpanding] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = complaints.filter(c => filter === 'all' || c.complaint_status === filter);

  const updateComplaint = async (id: string, status: ComplaintStatus, response?: string) => {
    setUpdating(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('complaints')
        .update({
          complaint_status: status,
          ...(response ? { admin_response: response } : {}),
        })
        .eq('id', id);

      if (error) throw error;
      
      const targetComplaint = complaints.find(c => c.id === id);
      if (targetComplaint) {
        await supabase.from('notifications').insert({
          user_id: targetComplaint.student_id,
          title: `Complaint Status: ${status === 'resolved' ? 'Resolved' : 'In Progress'}`,
          message: `Your concierge ticket "${targetComplaint.title}" status has been updated. ${response ? 'The admin has replied.' : ''}`,
        });
      }

      setComplaints(complaints.map(c =>
        c.id === id ? { ...c, complaint_status: status, admin_response: response || c.admin_response } : c
      ));
      toast.success('Complaint updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: complaints.length,
    pending: complaints.filter(c => c.complaint_status === 'pending').length,
    in_progress: complaints.filter(c => c.complaint_status === 'in_progress').length,
    resolved: complaints.filter(c => c.complaint_status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' },
        ] as { key: FilterStatus; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key ? 'bg-blue-500 text-white' : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {label} <span className="ml-1 opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Complaints */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium">No Complaints Found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((complaint) => {
            const isExpanded = expanding === complaint.id;
            return (
              <div key={complaint.id} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanding(isExpanded ? null : complaint.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{complaint.title}</div>
                        <div className="text-xs text-slate-400">
                          {complaint.student?.full_name || 'Student'} · {formatRelativeTime(complaint.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`badge ${getStatusColor(complaint.complaint_status)}`}>
                        {getStatusLabel(complaint.complaint_status)}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>

                    {complaint.image_url && (
                      <a href={complaint.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 text-sm hover:underline">
                        <ImageIcon className="w-4 h-4" /> View Attached Image
                      </a>
                    )}

                    {complaint.admin_response && (
                      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-blue-400 font-medium mb-1">Your Response:</p>
                        <p className="text-sm text-slate-300">{complaint.admin_response}</p>
                      </div>
                    )}

                    {/* Status update */}
                    {complaint.complaint_status !== 'resolved' && (
                      <div className="space-y-3">
                        <textarea
                          value={responses[complaint.id] || ''}
                          onChange={(e) => setResponses({ ...responses, [complaint.id]: e.target.value })}
                          placeholder="Write a response to the student..."
                          rows={3}
                          className="hms-input resize-none"
                        />
                        <div className="flex gap-2">
                          {complaint.complaint_status === 'pending' && (
                            <button
                              onClick={() => updateComplaint(complaint.id, 'in_progress', responses[complaint.id])}
                              disabled={updating === complaint.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                            >
                              {updating === complaint.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                              Mark In Progress
                            </button>
                          )}
                          <button
                            onClick={() => updateComplaint(complaint.id, 'resolved', responses[complaint.id])}
                            disabled={updating === complaint.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors"
                          >
                            {updating === complaint.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    )}
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
