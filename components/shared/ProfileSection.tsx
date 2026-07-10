import { cn } from '@/lib/utils';

export function ProfileSection({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  headVariant = 'tint',
}: {
  icon?: React.ElementType;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headVariant?: 'tint' | 'danger';
}) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className={cn('card-head', headVariant === 'danger' ? 'card-head-danger' : 'card-head-tint')}>
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <Icon
              size={14}
              className={cn('shrink-0', headVariant === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--primary)]')}
            />
          )}
          <div className="min-w-0">
            <p className="card-title">{title}</p>
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className={cn('card-body', bodyClassName)}>{children}</div>
    </div>
  );
}
