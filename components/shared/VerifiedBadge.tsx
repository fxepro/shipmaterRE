import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ label = 'DOT Verified', size = 'sm' }: VerifiedBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-sage-pale)] text-[var(--color-sage)] font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <ShieldCheck size={size === 'sm' ? 10 : 12} />
      {label}
    </span>
  );
}
