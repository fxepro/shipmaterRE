'use client';

import { getCountry, getSubdivisions } from '@/lib/countries';
import CountrySelect from '@/components/shared/CountrySelect';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AddressValue {
  address?: string;
  street?: string;   // alias of address used in some tables
  city: string;
  state: string;
  zip: string;       // raw field name kept for API compat
  country: string;
}

interface AddressFieldsProps {
  value: AddressValue;
  onChange: (updated: AddressValue) => void;
  /** Show the top-level street/address line */
  showStreet?: boolean;
  /** Required fields — defaults to city + country */
  required?: boolean;
  className?: string;
}

export default function AddressFields({
  value,
  onChange,
  showStreet = true,
  required = false,
  className = '',
}: AddressFieldsProps) {
  const country = getCountry(value.country || 'US');
  const subdivisions = getSubdivisions(value.country || 'US');

  const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch });

  const streetVal = value.address ?? value.street ?? '';

  return (
    <div className={`space-y-3 ${className}`}>
      {showStreet && (
        <div className="space-y-1">
          <Label htmlFor="addr-street">
            Street Address{required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id="addr-street"
            value={streetVal}
            onChange={e => set({ address: e.target.value, street: e.target.value })}
            placeholder="123 Main St, Suite 4"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="addr-city">
            City{required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id="addr-city"
            value={value.city ?? ''}
            onChange={e => set({ city: e.target.value })}
            placeholder="City"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="addr-zip">{country.postalLabel}</Label>
          <Input
            id="addr-zip"
            value={value.zip ?? ''}
            onChange={e => set({ zip: e.target.value })}
            placeholder={country.postalLabel}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* State/Province — dropdown for US/CA/MX, free text otherwise */}
        <div className="space-y-1">
          <Label htmlFor="addr-state">{country.stateLabel}</Label>
          {subdivisions ? (
            <Select
              value={value.state ?? ''}
              onValueChange={v => set({ state: v })}
            >
              <SelectTrigger id="addr-state">
                <SelectValue placeholder={`Select ${country.stateLabel}`} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {subdivisions.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="addr-state"
              value={value.state ?? ''}
              onChange={e => set({ state: e.target.value })}
              placeholder={country.stateLabel}
            />
          )}
        </div>

        <CountrySelect
          value={value.country || 'US'}
          onChange={code => {
            // Reset state when switching countries (old value is invalid)
            set({ country: code, state: '' });
          }}
          label="Country"
          required={required}
          id="addr-country"
        />
      </div>
    </div>
  );
}
