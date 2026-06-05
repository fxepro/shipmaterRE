'use client';

import { useEffect, useState } from 'react';
import { serviceTypeApi } from '@/lib/api';
import { CATEGORY_LABELS, type ServiceType } from '@/lib/serviceTypeRules';

interface Props {
  selected: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
}

export default function ServiceTypeSelector({ selected, onChange, disabled }: Props) {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceTypeApi.list()
      .then(res => setTypes(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  function toggle(key: string) {
    if (disabled) return;
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    );
  }

  // Group by category
  const grouped = types.reduce<Record<string, ServiceType[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const categoryOrder = ['commercial', 'specialized', 'medical', 'local'];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[var(--color-cream-dark)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {categoryOrder.filter(cat => grouped[cat]).map(cat => (
        <div key={cat}>
          <p className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-2">
            {CATEGORY_LABELS[cat]}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {grouped[cat].map(type => {
              const isSelected = selected.includes(type.key);
              return (
                <button
                  key={type.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(type.key)}
                  className={[
                    'flex items-start gap-2.5 rounded-xl border px-3 py-3 text-left transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isSelected
                      ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5 ring-1 ring-[var(--color-teal)]'
                      : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] hover:border-[var(--color-teal)]/50',
                  ].join(' ')}
                >
                  <span className="text-xl leading-none mt-0.5">{type.icon}</span>
                  <div className="min-w-0">
                    <p className={[
                      'text-xs font-medium leading-tight',
                      isSelected ? 'text-[var(--color-teal)]' : 'text-[var(--color-text)]',
                    ].join(' ')}>
                      {type.name}
                    </p>
                    {(type.requires_dot || type.requires_cdl || type.requires_hazmat) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {type.requires_dot    && <Badge>DOT</Badge>}
                        {type.requires_mc     && <Badge>MC</Badge>}
                        {type.requires_cdl    && <Badge>CDL</Badge>}
                        {type.requires_hazmat && <Badge>HAZMAT</Badge>}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {selected.length} service type{selected.length !== 1 ? 's' : ''} selected — your profile requirements have been updated below.
        </p>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded px-1 py-0.5 text-[10px] font-medium leading-none bg-[var(--color-cream-dark)] text-[var(--color-text-muted)]">
      {children}
    </span>
  );
}
