'use client';

import { useEffect, useRef, useState } from 'react';
import { serviceTypeApi } from '@/lib/api';

interface ServiceChild {
  id: number;
  key: string;
  name: string;
  requires_dot: boolean;
  requires_mc: boolean;
  requires_cdl: boolean;
  requires_hazmat: boolean;
}

interface ServiceCategory {
  id: number;
  key: string;
  name: string;
  icon: string;
  category: string;
  children: ServiceChild[];
}

interface Props {
  selected: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
}

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
  label,
  bold,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
  bold?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

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

function ReqBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none bg-amber-50 text-amber-700 border border-amber-200">
      {label}
    </span>
  );
}

export default function ServiceTypeSelector({ selected, onChange, disabled }: Props) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    serviceTypeApi.list()
      .then(res => {
        const data: ServiceCategory[] = res.data.data;
        setCategories(data);
        // Auto-expand categories that have at least one child selected
        const initialExpanded: Record<string, boolean> = {};
        data.forEach(cat => {
          if (cat.children.some(c => selected.includes(c.key))) {
            initialExpanded[cat.key] = true;
          }
        });
        setExpanded(initialExpanded);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function toggleExpand(key: string) {
    setExpanded(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleChild(childKey: string) {
    if (disabled) return;
    onChange(
      selected.includes(childKey)
        ? selected.filter(k => k !== childKey)
        : [...selected, childKey]
    );
  }

  function toggleCategory(cat: ServiceCategory) {
    if (disabled) return;
    const childKeys = cat.children.map(c => c.key);
    const allSelected = childKeys.every(k => selected.includes(k));

    if (allSelected) {
      // Deselect all children
      onChange(selected.filter(k => !childKeys.includes(k)));
    } else {
      // Select all children + expand
      const merged = [...new Set([...selected, ...childKeys])];
      onChange(merged);
      setExpanded(p => ({ ...p, [cat.key]: true }));
    }
  }

  function categoryState(cat: ServiceCategory): { checked: boolean; indeterminate: boolean } {
    const childKeys = cat.children.map(c => c.key);
    const selectedCount = childKeys.filter(k => selected.includes(k)).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === childKeys.length) return { checked: true, indeterminate: false };
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
          {totalSelected} service{totalSelected !== 1 ? 's' : ''} selected
        </p>
      )}

      {categories.map(cat => {
        const { checked, indeterminate } = categoryState(cat);
        const isOpen = !!expanded[cat.key];
        const hasSelection = checked || indeterminate;

        return (
          <div
            key={cat.key}
            className={[
              'rounded-xl border transition-colors',
              hasSelection
                ? 'border-[var(--color-teal)]/40 bg-[var(--color-teal)]/[0.03]'
                : 'border-[var(--color-cream-dark)] bg-[var(--color-white)]',
            ].join(' ')}
          >
            {/* Category row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <IndeterminateCheckbox
                checked={checked}
                indeterminate={indeterminate}
                onChange={() => toggleCategory(cat)}
                disabled={disabled}
                label=""
                bold
              />
              <button
                type="button"
                onClick={() => toggleExpand(cat.key)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <span className="text-lg leading-none">{cat.icon}</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{cat.name}</span>
                {indeterminate && (
                  <span className="text-xs text-[var(--color-teal)] font-medium ml-1">
                    ({cat.children.filter(c => selected.includes(c.key)).length}/{cat.children.length})
                  </span>
                )}
                <svg
                  className={`ml-auto h-4 w-4 text-[var(--color-text-faint)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Sub-services */}
            {isOpen && (
              <div className="border-t border-[var(--color-cream-dark)] px-4 py-3 space-y-2.5">
                {cat.children.map(child => (
                  <div key={child.key} className="flex items-center justify-between gap-3">
                    <IndeterminateCheckbox
                      checked={selected.includes(child.key)}
                      indeterminate={false}
                      onChange={() => toggleChild(child.key)}
                      disabled={disabled}
                      label={child.name}
                    />
                    <div className="flex gap-1 shrink-0">
                      {child.requires_dot    && <ReqBadge label="DOT" />}
                      {child.requires_mc     && <ReqBadge label="MC" />}
                      {child.requires_cdl    && <ReqBadge label="CDL" />}
                      {child.requires_hazmat && <ReqBadge label="HAZMAT" />}
                    </div>
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
