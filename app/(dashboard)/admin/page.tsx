'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatCard } from '@/components/shared/StatCard';
import { ShipmentTable } from '@/components/shipments/ShipmentTable';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: metricsRes } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get('/api/v1/admin/metrics'),
  });
  const { data: shipmentsRes, isLoading } = useQuery({
    queryKey: ['admin-shipments'],
    queryFn: () => api.get('/api/v1/admin/shipments', { params: { limit: 10 } }),
  });

  const metrics = metricsRes?.data?.data;
  const shipments = shipmentsRes?.data?.data ?? [];

  const stats = [
    { label: 'Total Shipments',   value: metrics?.total ?? '—' },
    { label: 'Active Today',      value: metrics?.active_today ?? '—', accentColor: 'var(--color-teal)' },
    { label: 'Disputed',          value: metrics?.disputed ?? '—', accentColor: 'var(--color-danger)' },
    { label: 'Platform Revenue',  value: metrics?.revenue ?? 0, currency: true, accentColor: 'var(--color-sage)' },
  ];

  const chartData: { date: string; count: number }[] = metrics?.daily ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>Admin Console</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-4">Shipments Per Day</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--color-white)', border: '1px solid var(--color-cream-dark)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="count" stroke="var(--color-slate)" strokeWidth={2} dot={false} activeDot={{ fill: 'var(--color-teal)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent shipments */}
      <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="px-5 py-4 border-b border-[var(--color-cream-dark)]">
          <p className="font-medium text-[var(--color-text)]">Recent Shipments</p>
        </div>
        {isLoading ? <div className="skeleton h-48 m-4 rounded-lg" /> : <div className="p-1"><ShipmentTable shipments={shipments} basePath="/admin/shipments" /></div>}
      </div>
    </div>
  );
}
