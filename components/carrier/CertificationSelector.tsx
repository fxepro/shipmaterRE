'use client';

import { useEffect, useRef, useState } from 'react';
import { certificationApi } from '@/lib/api';

interface CertChild {
  id: number;
  key: string;
  name: string;
  description: string | null;
}

interface CertCategory {
  id: number;
  key: string;
  name: string;
  icon: string;
  category: string;
  children: CertChild[];
}

interface Props {
  selected: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
}

function IndeterminateCheckbox({
  checked, indeterminate, onChange, disabled, label, bold,
}: {
  checked: boolean; indeterminate: boolean; onChange: () => void;
  disabled?: boolean; label: string; bold?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);

  return (
    <label className={`flex items-center gap-2.5 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="w-4 h-4 rounded accent-[var(--color-teal)] cursor-pointer shrink-0"
      />
      <span className={`text-sm ${bold ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'} transition-colors`}>
        {label}
      </span>
    </label>
  );
}

export default function CertificationSelector({ selected, onChange, disabled }: Props) {
  const [categories, setCategories] = useState<CertCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});

  useEffect(() => {
    certificationApi.list()
      .then(res => {
        const data: CertCategory[] = res.data.data;
        setCategories(data);
        const init: Record<string, boolean> = {};
        data.forEach(cat => {
          if (cat.children.some(c => selected.includes(c.key))) init[cat.key] = true;
        });
        setExpanded(init);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function toggleExpand(key: string) {
    setExpanded(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleChild(key: string) {
    if (disabled) return;
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  }

  function toggleCategory(cat: CertCategory) {
    if (disabled) return;
    const keys = cat.children.map(c => c.key);
    const allSelected = keys.every(k => selected.includes(k));
    if (allSelected) {
      onChange(selected.filter(k => !keys.includes(k)));
    } else {
      onChange([...new Set([...selected, ...keys])]);
      setExpanded(p => ({ ...p, [cat.key]: true }));
    }
  }

  function categoryState(cat: CertCategory) {
    const keys = cat.children.map(c => c.key);
    const count = keys.filter(k => selected.includes(k)).length;
    if (count === 0)          return { checked: false, indeterminate: false };
    if (count === keys.length) return { checked: true,  indeterminate: false };
    return { checked: false, indeterminate: true };
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-[var(--color-cream-dark)]" />
        ))}
      </div>
    );
  }

  const totalSelected = selected.length;

  return (
    <div className="space-y-1">
      {totalSelected > 0 && (
        <p className="text-xs text-[var(--color-teal)] font-medium mb-3">
          {totalSelected} certification{totalSelected !== 1 ? 's' : ''} selected
        </p>
      )}

      {categories.map(cat => {
        const { checked, indeterminate } = categoryState(cat);
        const isOpen      = !!expanded[cat.key];
        const hasSelection = checked || indeterminate;

        return (
          <div key={cat.key} className={[
            'rounded-xl border transition-colors',
            hasSelection
              ? 'border-[var(--color-teal)]/40 bg-[var(--color-teal)]/[0.03]'
              : 'border-[var(--color-cream-dark)] bg-[var(--color-white)]',
          ].join(' ')}>

            {/* Category row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <IndeterminateCheckbox
                checked={checked} indeterminate={indeterminate}
                onChange={() => toggleCategory(cat)}
                disabled={disabled} label="" bold
              />
              <button type="button" onClick={() => toggleExpand(cat.key)}
                className="flex items-center gap-2 flex-1 text-left">
                <span className="text-lg leading-none">{cat.icon}</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{cat.name}</span>
                {indeterminate && (
                  <span className="text-xs text-[var(--color-teal)] font-medium ml-1">
                    ({cat.children.filter(c => selected.includes(c.key)).length}/{cat.children.length})
                  </span>
                )}
                <svg className={`ml-auto h-4 w-4 text-[var(--color-text-faint)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Children */}
            {isOpen && (
              <div className="border-t border-[var(--color-cream-dark)] px-4 py-3 space-y-3">
                {cat.children.map(child => (
                  <div key={child.key}>
                    <IndeterminateCheckbox
                      checked={selected.includes(child.key)} indeterminate={false}
                      onChange={() => toggleChild(child.key)}
                      disabled={disabled} label={child.name}
                    />
                    {child.description && (
                      <p className="text-xs text-[var(--color-text-faint)] ml-[26px] mt-0.5 leading-relaxed">
                        {child.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
