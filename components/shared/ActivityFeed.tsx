'use client';

import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: number;
  type: 'bid' | 'status' | 'gps' | 'payment' | 'system';
  message: string;
  time: string;
}

const DOT_COLOR: Record<ActivityItem['type'], string> = {
  bid:     'var(--primary)',
  status:  'var(--navy)',
  gps:     'var(--info)',
  payment: 'var(--success)',
  system:  'var(--border-strong)',
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: DOT_COLOR[item.type] }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm" style={{ color: 'var(--text)' }}>{item.message}</p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
