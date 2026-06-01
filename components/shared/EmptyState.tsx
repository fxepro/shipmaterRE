import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-cream-dark)]">
        <Icon size={28} className="text-[var(--color-text-faint)]" />
      </div>
      <h3 className="text-xl text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-lg bg-[var(--color-slate)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
