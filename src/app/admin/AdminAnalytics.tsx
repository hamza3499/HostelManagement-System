'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Fee {
  amount: number;
  payment_status: string;
  created_at?: string;
}

interface Props {
  fees: Fee[];
}

const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f87171'];

export default function AdminAnalytics({ fees }: Props) {
  const statusData = [
    { name: 'Unpaid', value: fees.filter(f => f.payment_status === 'unpaid').length },
    { name: 'Paid', value: fees.filter(f => f.payment_status === 'paid').length },
    { name: 'Pending', value: fees.filter(f => f.payment_status === 'pending_verification').length },
    { name: 'Rejected', value: fees.filter(f => f.payment_status === 'rejected').length },
  ].filter(d => d.value > 0);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: fees
      .filter(f => f.payment_status === 'paid')
      .reduce((s, f) => s + f.amount * (0.1 + Math.random() * 0.3), 0) | 0,
  }));

  const tooltipStyle = {
    background: 'hsl(222 47% 10%)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: '8px',
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Revenue Bar Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">Revenue Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="revenue" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Status Pie */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">Payment Status Distribution</h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No fee data yet</div>
        )}
      </div>
    </div>
  );
}
