'use client';

import { ChevronDown } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export default function CountrySelect({
  value,
  onChange,
  label = 'Country',
  required = false,
  className = '',
  id = 'country',
}: CountrySelectProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="profile-label">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="profile-select-wrap">
        <select
          id={id}
          className="profile-select"
          value={value || 'US'}
          onChange={e => onChange(e.target.value)}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
      </div>
    </div>
  );
}
