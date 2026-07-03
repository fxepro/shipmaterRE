import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ label = 'DOT Verified', size = 'sm' }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
    >
      <ShieldCheck size={size === 'sm' ? 10 : 12} />
      {label}
    </span>
  );
}
