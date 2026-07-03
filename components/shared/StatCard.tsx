'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /** Accent bar color token. Defaults to the primary brand color. */
  accentColor?: string;
  trend?: { direction: 'up' | 'down'; label: string };
  currency?: boolean;
}

export function StatCard({ label, value, sub, accentColor, trend, currency }: StatCardProps) {
  return (
    <div className="stat">
      <div className="stat-accent" style={accentColor ? { background: accentColor } : undefined} />
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">
          {currency && <span className="text-xl mr-0.5">$</span>}
          {value}
        </p>
        {sub && <p className="stat-sub">{sub}</p>}
        {trend && (
          <div
            className={cn('mt-2 flex items-center gap-1 text-sm font-medium')}
            style={{ color: trend.direction === 'up' ? 'var(--success)' : 'var(--danger)' }}
          >
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
