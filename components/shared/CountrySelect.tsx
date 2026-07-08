'use client';

import { COUNTRIES } from '@/lib/countries';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value || 'US'} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select country…" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {COUNTRIES.map(c => (
            <SelectItem key={c.code} value={c.code}>
              <span className="mr-2">{c.flag}</span>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
