import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={28} style={{ color: 'var(--text-faint)' }} />
      </div>
      <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn-navy mt-5">
          {action.label}
        </button>
      )}
    </div>
  );
}
