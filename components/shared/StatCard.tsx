'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
  trend?: { direction: 'up' | 'down'; label: string };
  currency?: boolean;
}

export function StatCard({ label, value, sub, accentColor = 'var(--color-teal)', trend, currency }: StatCardProps) {
  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="h-[3px]" style={{ backgroundColor: accentColor }} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-2">
          {label}
        </p>
        <p
          className="text-3xl text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {currency && <span className="text-xl mr-0.5">$</span>}
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{sub}</p>
        )}
        {trend && (
          <div className={cn('mt-2 flex items-center gap-1 text-sm font-medium', trend.direction === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
