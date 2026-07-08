'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Globe } from 'lucide-react';
import { getCountry } from '@/lib/countries';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';
const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5';

// ── Licence class options per region ────────────────────────────────────────

const CDL_OPTIONS_US  = [['A', 'Class A — combination over 26,001 lbs'], ['B', 'Class B — single vehicle up to 26,000 lbs'], ['C', 'Class C — specialized']] as const;
const CDL_OPTIONS_CA  = [['1', 'Class 1 — tractor-trailers'], ['2', 'Class 2 — buses'], ['3', 'Class 3 — trucks to 11,000 kg GVWR'], ['4', 'Class 4 — emergency / shuttle'], ['5', 'Class 5 — standard automobile']] as const;
const CDL_OPTIONS_EU  = [['C', 'Category C — rigid truck >3,500 kg'], ['CE', 'Category C+E — articulated truck'], ['C1', 'Category C1 — 3,500–7,500 kg'], ['C1E', 'Category C1+E — C1 with trailer']] as const;
const CDL_OPTIONS_MX  = [['federal', 'Licencia Federal de Conductor'], ['B', 'Tipo B — light commercial'], ['C', 'Tipo C — heavy truck'], ['E', 'Tipo E — articulated']] as const;

const AUTHORITY_TYPES = [
  ['MC',              'Motor Carrier (MC#) — USA'],
  ['NSC',             'National Safety Code (NSC) — Canada'],
  ['community_licence','Community Licence — EU'],
  ['TIR',             'TIR Carnet — International road transit'],
  ['SCT',             'Permiso SCT — Mexico'],
  ['other',           'Other / National permit'],
] as const;

interface CommercialForm {
  // CDL / Commercial Licence
  cdl_number: string;
  cdl_issuing_state: string;
  dl_country: string;
  cdl_expiry_date: string;
  cdl_class: string;
  // US authority
  usdot_number: string;
  mc_number: string;
  // Non-US authority
  operating_authority_number: string;
  operating_authority_type: string;
  // Endorsements
  hazmat_endorsement: boolean;
  hazmat_expiry_date: string;
  tanker_endorsement: boolean;
  passenger_endorsement: boolean;
}

export function DotCommercialTab() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  const [form, setForm] = useState<CommercialForm>({
    cdl_number: '', cdl_issuing_state: '', dl_country: 'US',
    cdl_expiry_date: '', cdl_class: '',
    usdot_number: '', mc_number: '',
    operating_authority_number: '', operating_authority_type: '',
    hazmat_endorsement: false, hazmat_expiry_date: '',
    tanker_endorsement: false, passenger_endorsement: false,
  });
  const [isReady, setIsReady] = useState(false);

  // operating_country comes from the personal tab — we read it here to drive UI
  const operatingCountry: string = profile?.operating_country ?? 'US';

  useEffect(() => {
    if (profile && !isReady) {
      setForm({
        cdl_number:                 profile.cdl_number                  ?? '',
        cdl_issuing_state:          profile.cdl_issuing_state           ?? '',
        dl_country:                 profile.dl_country                  ?? operatingCountry,
        cdl_expiry_date:            profile.cdl_expiry_date             ?? '',
        cdl_class:                  profile.cdl_class                   ?? '',
        usdot_number:               profile.usdot_number                ?? '',
        mc_number:                  profile.mc_number                   ?? '',
        operating_authority_number: profile.operating_authority_number  ?? '',
        operating_authority_type:   profile.operating_authority_type    ?? '',
        hazmat_endorsement:         profile.hazmat_endorsement          ?? false,
        hazmat_expiry_date:         profile.hazmat_expiry_date          ?? '',
        tanker_endorsement:         profile.tanker_endorsement          ?? false,
        passenger_endorsement:      profile.passenger_endorsement       ?? false,
      });
      setIsReady(true);
    }
  }, [profile, isReady, operatingCountry]);

  const updateMutation = useMutation({
    mutationFn: (data: CommercialForm) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Commercial credentials saved.');
    },
    onError: () => toast.error('Failed to save.'),
  });

  const set = <K extends keyof CommercialForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const isUS = operatingCountry === 'US';
  const isCA = operatingCountry === 'CA';
  const isMX = operatingCountry === 'MX';
  const isUSCA = isUS || isCA || isMX;

  // Labels vary by country
  const licenceLabel = isUS ? 'Commercial Driver\'s License (CDL)' : isCA ? 'Commercial Driver\'s Licence' : isMX ? 'Licencia Federal de Conductor' : 'Commercial Driving Licence';
  const classLabel   = isUS ? 'CDL Class' : isCA ? 'Licence Class' : isMX ? 'Tipo' : 'Category';
  const classOptions = isUS ? CDL_OPTIONS_US : isCA ? CDL_OPTIONS_CA : isMX ? CDL_OPTIONS_MX : CDL_OPTIONS_EU;
  const opCountry    = getCountry(operatingCountry);

  if (isLoading) return <div className="text-center py-8 text-sm text-[var(--color-text-faint)]">Loading…</div>;

  return (
    <div className="space-y-6">

      {/* Context banner showing active operating country */}
      <div className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3 flex items-center gap-2.5 text-sm">
        <Globe size={14} className="text-[var(--color-teal)] shrink-0" />
        <span className="text-[var(--color-text-faint)]">
          Operating country:&nbsp;
        </span>
        <span className="font-semibold text-[var(--color-text)]">{opCountry.flag} {opCountry.name}</span>
        <span className="ml-auto text-xs text-[var(--color-text-faint)]">
          Change in Personal tab
        </span>
      </div>

      {!isUS && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">{licenceLabel}</p>
            <p className="text-sm text-blue-800 mt-1">
              {isCA
                ? 'Enter your provincial commercial licence. Operating Authority number is your NSC number from Transport Canada.'
                : isMX
                ? 'Enter your Licencia Federal de Conductor issued by SICT. Operating permit is your Permiso SCT.'
                : 'Enter your national commercial driving licence details and operating authority/permit number.'}
            </p>
          </div>
        </div>
      )}

      {isUS && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">DOT-Commercial Information</p>
            <p className="text-sm text-blue-800 mt-1">
              Optional — only complete if you operate under your own carrier authority. Employee drivers can skip USDOT/MC.
            </p>
          </div>
        </div>
      )}

      {/* Licence */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-3">
          {licenceLabel}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Licence Number</label>
            <input
              type="text"
              value={form.cdl_number}
              onChange={set('cdl_number')}
              className={inputCls}
              placeholder={isUS ? 'e.g. 123456789' : isCA ? 'e.g. A1234-56789-01234' : 'Licence number'}
            />
          </div>

          <div>
            <label className={labelCls}>{classLabel}</label>
            <select value={form.cdl_class} onChange={set('cdl_class')} className={inputCls}>
              <option value="">Select…</option>
              {classOptions.map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Expiry Date</label>
            <input type="date" value={form.cdl_expiry_date} onChange={set('cdl_expiry_date')} className={inputCls} />
          </div>

          {isUSCA && (
            <div>
              <label className={labelCls}>{isUS ? 'Issuing State' : isCA ? 'Issuing Province' : 'Issuing State'}</label>
              <input
                type="text"
                value={form.cdl_issuing_state}
                onChange={set('cdl_issuing_state')}
                className={inputCls}
                placeholder={isUS ? 'TX' : isCA ? 'ON' : 'State/Province'}
              />
            </div>
          )}

          {!isUSCA && (
            <div>
              <label className={labelCls}>Issuing Country</label>
              <input
                type="text"
                value={form.dl_country}
                onChange={set('dl_country')}
                className={inputCls}
                placeholder="ISO 2-letter code (e.g. DE)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Operating Authority */}
      <div className="border-t border-[var(--color-cream-dark)] pt-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-3">
          Operating Authority
        </h3>

        {isUS ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>USDOT Number (Optional)</label>
              <input
                type="text"
                value={form.usdot_number}
                onChange={set('usdot_number')}
                className={inputCls}
                placeholder="e.g. 1234567"
              />
              <p className="text-xs text-[var(--color-text-faint)] mt-1">Required for interstate operations</p>
            </div>
            <div>
              <label className={labelCls}>MC Number (Optional)</label>
              <input
                type="text"
                value={form.mc_number}
                onChange={set('mc_number')}
                className={inputCls}
                placeholder="e.g. MC-123456"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Authority Type</label>
              <select
                value={form.operating_authority_type}
                onChange={set('operating_authority_type')}
                className={inputCls}
              >
                <option value="">Select type…</option>
                {AUTHORITY_TYPES.map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Authority Number</label>
              <input
                type="text"
                value={form.operating_authority_number}
                onChange={set('operating_authority_number')}
                className={inputCls}
                placeholder={isCA ? 'NSC-12345' : isMX ? 'Permiso SCT…' : 'Authority / permit number'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Endorsements (US / Canada — relevant for HAZMAT globally too) */}
      <div className="border-t border-[var(--color-cream-dark)] pt-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-faint)] mb-3">
          Endorsements & Special Authorizations
        </h3>
        <div className="space-y-3">
          {[
            { key: 'hazmat_endorsement' as const, label: 'Dangerous Goods / HazMat' },
            { key: 'tanker_endorsement' as const, label: 'Tank Vehicle / Tanker' },
            { key: 'passenger_endorsement' as const, label: 'Passenger / Bus' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-[var(--color-cream-dark)]"
              />
              <span className="text-sm text-[var(--color-text)]">{label}</span>
            </label>
          ))}

          {form.hazmat_endorsement && (
            <div className="pl-7">
              <label className={labelCls}>DG/HazMat Endorsement Expiry</label>
              <input
                type="date"
                value={form.hazmat_expiry_date}
                onChange={set('hazmat_expiry_date')}
                className={`${inputCls} max-w-xs`}
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => updateMutation.mutate(form)}
        disabled={updateMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-60 transition-colors"
      >
        {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {updateMutation.isPending ? 'Saving…' : 'Save Credentials'}
      </button>
    </div>
  );
}
