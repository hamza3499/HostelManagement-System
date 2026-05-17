'use client';

import { useState } from 'react';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

interface Props { students: Profile[] }

export default function AdminStudentsClient({ students }: Props) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="hms-input pl-10"
        />
      </div>

      <div className="text-sm text-slate-400">
        Showing <span className="text-white font-medium">{filtered.length}</span> students
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Students Found</h3>
          <p className="text-slate-400 text-sm">No students match your search.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="hms-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {student.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{student.full_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{student.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-slate-300">{formatDate(student.created_at)}</td>
                    <td>
                      <span className="badge bg-green-500/20 text-green-400 border-green-500/30">Active</span>
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
