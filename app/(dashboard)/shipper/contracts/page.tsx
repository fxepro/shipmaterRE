'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi, preferredCarrierApi } from '@/lib/api';
import {
  FileText, Plus, X, Search, ChevronDown,
  CheckCircle2, AlertCircle, Clock, Archive,
  Truck, DollarSign, CalendarDays, Hash,
  ChevronRight, Pencil, Weight, Timer,
  CreditCard, Star, RotateCcw, Loader2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type RateType      = 'Per mile' | 'Flat rate' | 'Hourly';
type EquipmentType = 'Dry Van' | 'Flatbed' | 'Reefer' | 'Step Deck' | 'LTL';
type PaymentTerms  = 'Net 15' | 'Net 30' | 'Net 45' | 'Quick Pay';
type Priority      = 'First Call' | 'Preferred' | 'Standard';
type ContractStatus = 'active' | 'pending' | 'expired' | 'draft';

interface Contract {
  id: number;
  carrierId: number;
  carrier: string;
  carrierCompany: string;
  carrierAvatar: string;
  // Rates
  rateType: RateType;
  rate: string;
  fuelSurcharge: string;
  detentionRate: string;
  freeTime: string;
  // Logistics
  equipmentType: EquipmentType;
  maxWeight: string;
  coverage: string;
  // Terms
  paymentTerms: PaymentTerms;
  priority: Priority;
  autoRenew: boolean;
  validFrom: string;
  validTo: string;
  status: ContractStatus;
  notes: string;
  shipmentsUnder: number;
}

interface CarrierOption {
  carrierId: number;
  name: string;
  company: string;
  label: string;
}

// ── Transform ─────────────────────────────────────────────────────────────────

function toContract(r: any): Contract {
  return {
    id:             r.id,
    carrierId:      r.carrier_id,
    carrier:        r.carrier ?? '',
    carrierCompany: r.carrier_company ?? '',
    carrierAvatar:  r.carrier_avatar ?? '',
    rateType:       r.rate_type as RateType,
    rate:           r.rate ?? '',
    fuelSurcharge:  r.fuel_surcharge ?? '',
    detentionRate:  r.detention_rate ?? '',
    freeTime:       r.free_time ?? '2',
    equipmentType:  (r.equipment_type || 'Dry Van') as EquipmentType,
    maxWeight:      r.max_weight ?? '',
    coverage:       r.coverage ?? '',
    paymentTerms:   r.payment_terms as PaymentTerms,
    priority:       r.priority as Priority,
    autoRenew:      r.auto_renew ?? false,
    validFrom:      r.valid_from ?? '',
    validTo:        r.valid_to ?? '',
    status:         r.status as ContractStatus,
    notes:          r.notes ?? '',
    shipmentsUnder: r.shipments_under ?? 0,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContractStatus }) {
  const map: Record<ContractStatus, { cls: string; icon: React.ElementType; label: string }> = {
    active:  { cls: 'bg-emerald-50 text-emerald-700',  icon: CheckCircle2, label: 'Active'  },
    pending: { cls: 'bg-amber-50 text-amber-700',       icon: Clock,        label: 'Pending' },
    expired: { cls: 'bg-red-50 text-red-600',           icon: AlertCircle,  label: 'Expired' },
    draft:   { cls: 'bg-[var(--color-cream)] text-[var(--color-text-muted)]', icon: FileText, label: 'Draft' },
  };
  const { cls, icon: Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={10} /> {label}
    </span>
  );
}

// ── New Contract Modal ────────────────────────────────────────────────────────

const EQUIPMENT_TYPES: EquipmentType[] = ['Dry Van', 'Flatbed', 'Reefer', 'Step Deck', 'LTL'];
const PAYMENT_TERMS: PaymentTerms[]    = ['Net 15', 'Net 30', 'Net 45', 'Quick Pay'];
const PRIORITIES: Priority[]           = ['First Call', 'Preferred', 'Standard'];

function NewContractModal({
  onClose,
  carriers,
}: {
  onClose: () => void;
  carriers: CarrierOption[];
}) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    carrierId:     carriers[0]?.carrierId ?? 0,
    rateType:      'Per mile' as RateType,
    rate:          '',
    fuelSurcharge: '',
    detentionRate: '',
    freeTime:      '2',
    equipmentType: 'Dry Van' as EquipmentType,
    maxWeight:     '',
    coverage:      '',
    paymentTerms:  'Net 30' as PaymentTerms,
    priority:      'Preferred' as Priority,
    autoRenew:     false,
    validFrom:     '',
    validTo:       '',
    notes:         '',
  });

  const set = (k: keyof typeof form) => (v: string | boolean | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.carrierId && form.rate && form.coverage && form.validFrom && form.validTo;

  const createMutation = useMutation({
    mutationFn: (asDraft: boolean) =>
      contractApi.create({
        carrier_id:     form.carrierId,
        rate_type:      form.rateType,
        rate:           parseFloat(form.rate),
        fuel_surcharge: form.fuelSurcharge ? parseFloat(form.fuelSurcharge) : null,
        detention_rate: form.detentionRate ? parseFloat(form.detentionRate) : null,
        free_time_hrs:  parseInt(form.freeTime || '2'),
        equipment_type: form.equipmentType,
        max_weight_lbs: form.maxWeight ? parseInt(form.maxWeight.replace(/[^0-9]/g, '')) : null,
        coverage:       form.coverage,
        payment_terms:  form.paymentTerms,
        priority:       form.priority,
        auto_renew:     form.autoRenew,
        valid_from:     form.validFrom,
        valid_to:       form.validTo,
        status:         asDraft ? 'draft' : 'pending',
        notes:          form.notes || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      onClose();
    },
  });

  const inputCls = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20';
  const labelCls = 'block mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]';

  const SectionHead = ({ title }: { title: string }) => (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-teal)] border-b border-[var(--color-cream-dark)] pb-1.5 mb-3 mt-1">
      {title}
    </p>
  );

  const SelectField = ({
    label,
    field,
    options,
  }: {
    label: string;
    field: keyof typeof form;
    options: string[];
  }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select
          value={form[field] as string}
          onChange={(e) => set(field)(e.target.value)}
          className={`${inputCls} appearance-none pr-8`}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--color-white)] shadow-2xl max-h-[92vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-cream-dark)]">
          <h3 className="text-base font-semibold text-[var(--color-text)]">New contract</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Carrier ── */}
          <SectionHead title="Carrier" />
          <div>
            <label className={labelCls}>Carrier</label>
            <div className="relative">
              <select
                value={form.carrierId}
                onChange={(e) => set('carrierId')(parseInt(e.target.value))}
                className={`${inputCls} appearance-none pr-8`}
              >
                {carriers.length === 0 && (
                  <option value={0} disabled>No preferred carriers — add one first</option>
                )}
                {carriers.map((c) => (
                  <option key={c.carrierId} value={c.carrierId}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            </div>
          </div>

          {/* ── Rates ── */}
          <SectionHead title="Rates" />

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Rate type" field="rateType" options={['Per mile', 'Flat rate', 'Hourly']} />
            <div>
              <label className={labelCls}>
                {form.rateType === 'Per mile' ? 'Rate ($/mile)' : form.rateType === 'Hourly' ? 'Rate ($/hr)' : 'Flat rate ($)'}
              </label>
              <div className="relative">
                <DollarSign size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input
                  value={form.rate}
                  onChange={(e) => set('rate')(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder={form.rateType === 'Per mile' ? '2.85' : form.rateType === 'Hourly' ? '145' : '950'}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Fuel surcharge ($/mile) <span className="normal-case font-normal opacity-60">optional</span>
              </label>
              <div className="relative">
                <DollarSign size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input
                  value={form.fuelSurcharge}
                  onChange={(e) => set('fuelSurcharge')(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.18"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Detention rate ($/hr) <span className="normal-case font-normal opacity-60">optional</span>
              </label>
              <div className="relative">
                <DollarSign size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input
                  value={form.detentionRate}
                  onChange={(e) => set('detentionRate')(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="55"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
          </div>

          <div className="w-1/2 pr-1.5">
            <label className={labelCls}>Free detention time (hrs)</label>
            <div className="relative">
              <Timer size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
              <input
                value={form.freeTime}
                onChange={(e) => set('freeTime')(e.target.value.replace(/\D/g, ''))}
                placeholder="2"
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>

          {/* ── Equipment & load ── */}
          <SectionHead title="Equipment & Load" />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Equipment type" field="equipmentType" options={EQUIPMENT_TYPES} />
            <div>
              <label className={labelCls}>Max weight (lbs)</label>
              <div className="relative">
                <Weight size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input
                  value={form.maxWeight}
                  onChange={(e) => set('maxWeight')(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="45000"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Coverage area / lanes</label>
            <input
              value={form.coverage}
              onChange={(e) => set('coverage')(e.target.value)}
              placeholder="e.g. CO, WY, UT or Pacific Northwest"
              className={inputCls}
            />
          </div>

          {/* ── Terms ── */}
          <SectionHead title="Terms" />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Payment terms" field="paymentTerms" options={PAYMENT_TERMS} />
            <SelectField label="Priority" field="priority" options={PRIORITIES} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Valid from</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => set('validFrom')(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Valid to</label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => set('validTo')(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Auto-renew */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Auto-renew</p>
              <p className="text-xs text-[var(--color-text-faint)]">Automatically renew this contract when it expires</p>
            </div>
            <button
              role="switch"
              aria-checked={form.autoRenew}
              onClick={() => set('autoRenew')(!form.autoRenew)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                form.autoRenew ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                form.autoRenew ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>
              Terms / notes <span className="normal-case font-normal opacity-60">optional</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              rows={3}
              placeholder="Special conditions, weight limits, priority rules…"
              className={`${inputCls} resize-none`}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
          <button
            onClick={() => createMutation.mutate(true)}
            disabled={!form.carrierId || createMutation.isPending}
            className="flex-1 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => createMutation.mutate(false)}
            disabled={!valid || createMutation.isPending}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              valid && !createMutation.isPending
                ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
            }`}
          >
            {createMutation.isPending && <Loader2 size={13} className="animate-spin" />}
            Send for signature
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contract Detail Drawer ────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <Icon size={13} className="text-[var(--color-teal)] shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-faint)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{value}</p>
      </div>
    </div>
  );
}

function ContractDrawer({
  contract,
  onClose,
  onArchive,
  archiving,
}: {
  contract: Contract;
  onClose: () => void;
  onArchive: (id: number) => void;
  archiving: boolean;
}) {
  const rateLabel: Record<RateType, string> = {
    'Per mile':  'per mile',
    'Flat rate': 'flat',
    'Hourly':    'per hour',
  };

  const priorityColor: Record<Priority, string> = {
    'First Call': 'bg-[var(--color-teal-pale)] text-[var(--color-teal)] border-[var(--color-teal)]',
    'Preferred':  'bg-amber-50 text-amber-700 border-amber-200',
    'Standard':   'bg-[var(--color-cream)] text-[var(--color-text-muted)] border-[var(--color-cream-dark)]',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel — 50% width */}
      <div className="fixed right-0 top-0 z-50 h-full w-1/2 min-w-[520px] bg-[var(--color-cream)] shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]">
          <p className="text-base font-semibold text-[var(--color-text)]">Contract details</p>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Carrier identity */}
        <div className="px-6 py-5 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-slate)] text-sm font-bold text-white">
              {contract.carrierAvatar}
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--color-text)]">{contract.carrier}</p>
              <p className="text-sm text-[var(--color-text-faint)]">{contract.carrierCompany}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={contract.status} />
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColor[contract.priority]}`}>
              <Star size={9} /> {contract.priority}
            </span>
            {contract.autoRenew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold">
                <RotateCcw size={9} /> Auto-renew
              </span>
            )}
          </div>
        </div>

        {/* Rate highlight */}
        <div className="px-6 py-5 border-b border-[var(--color-cream-dark)]">
          <div className="rounded-xl bg-[var(--color-teal-pale)] border border-[var(--color-teal)] p-4 text-center mb-3">
            <p className="text-3xl font-bold text-[var(--color-slate)]">{contract.rate}</p>
            <p className="text-sm text-[var(--color-text-faint)] mt-0.5">{rateLabel[contract.rateType]}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {contract.fuelSurcharge && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-3">
                <p className="text-xs text-[var(--color-text-faint)] mb-0.5">Fuel surcharge</p>
                <p className="text-sm font-bold text-[var(--color-slate)]">
                  {contract.fuelSurcharge}
                  <span className="text-xs font-normal text-[var(--color-text-faint)]">/mile</span>
                </p>
              </div>
            )}
            {contract.detentionRate && (
              <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-3">
                <p className="text-xs text-[var(--color-text-faint)] mb-0.5">Detention</p>
                <p className="text-sm font-bold text-[var(--color-slate)]">
                  {contract.detentionRate}
                  <span className="text-xs font-normal text-[var(--color-text-faint)]">
                    /hr after {contract.freeTime}h free
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Equipment & Coverage */}
        <div className="px-6 py-5 space-y-3.5 border-b border-[var(--color-cream-dark)]">
          <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
            Equipment & Coverage
          </p>
          <DetailRow icon={Truck}    label="Equipment type"  value={contract.equipmentType} />
          <DetailRow icon={Hash}     label="Max weight"      value={contract.maxWeight ? `${contract.maxWeight} lbs` : null} />
          <DetailRow icon={FileText} label="Coverage area"   value={contract.coverage} />
          <DetailRow icon={FileText} label="Shipments under" value={`${contract.shipmentsUnder} shipments`} />
        </div>

        {/* Terms */}
        <div className="px-6 py-5 space-y-3.5 border-b border-[var(--color-cream-dark)]">
          <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Terms</p>
          <DetailRow icon={CreditCard}   label="Payment terms" value={contract.paymentTerms} />
          <DetailRow icon={CalendarDays} label="Valid from"    value={contract.validFrom} />
          <DetailRow icon={CalendarDays} label="Valid to"      value={contract.validTo} />
        </div>

        {/* Notes */}
        {contract.notes && (
          <div className="px-6 py-5 border-b border-[var(--color-cream-dark)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Notes</p>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">{contract.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-5 space-y-2 mt-auto">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/contracts/${contract.id}/agreement`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-teal)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] transition-colors shadow-sm"
          >
            <FileText size={13} /> View Agreement PDF
          </a>
          <button
            onClick={() => { onArchive(contract.id); }}
            disabled={archiving}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {archiving ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
            Archive contract
          </button>
        </div>

      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: ContractStatus | 'all'; label: string }[] = [
  { value: 'all',     label: 'All'     },
  { value: 'active',  label: 'Active'  },
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'draft',   label: 'Draft'   },
];

export default function ShipperContractsPage() {
  const qc = useQueryClient();
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<ContractStatus | 'all'>('all');
  const [showNew, setShowNew]   = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn:  () =>
      contractApi.list().then((r) => (r.data.data as any[]).map(toContract)),
  });

  // Preferred carriers for the new-contract modal dropdown (separate key to avoid transform collision)
  const { data: rawCarriers = [] } = useQuery<CarrierOption[]>({
    queryKey: ['preferred-carriers-options'],
    queryFn:  () =>
      preferredCarrierApi.list().then((r) =>
        (r.data.data as any[]).map((c: any) => ({
          carrierId: c.carrier_id,
          name:      c.name,
          company:   c.company,
          label:     `${c.name} (${c.company})`,
        }))
      ),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const archiveMutation = useMutation({
    mutationFn: (id: number) => contractApi.destroy(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      if (selected?.id === id) setSelected(null);
    },
  });

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = contracts.filter((c) => {
    const matchFilter = filter === 'all' || c.status === filter;
    const matchSearch = [c.carrier, c.carrierCompany, c.coverage, c.rateType, c.equipmentType].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    return matchFilter && matchSearch;
  });

  const counts = {
    active:  contracts.filter((c) => c.status === 'active').length,
    pending: contracts.filter((c) => c.status === 'pending').length,
    expired: contracts.filter((c) => c.status === 'expired').length,
  };

  return (
    <>
      {showNew && (
        <NewContractModal
          onClose={() => setShowNew(false)}
          carriers={rawCarriers}
        />
      )}
      {selected && (
        <ContractDrawer
          contract={selected}
          onClose={() => setSelected(null)}
          onArchive={(id) => archiveMutation.mutate(id)}
          archiving={archiveMutation.isPending}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl text-[var(--color-slate)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Carrier Contracts
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
              Rate agreements, terms and coverage with your preferred carriers
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors"
          >
            <Plus size={15} /> New contract
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active contracts',   value: counts.active,  icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Awaiting signature', value: counts.pending, icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50'   },
            { label: 'Expired',            value: counts.expired, icon: AlertCircle,  color: 'text-red-500',     bg: 'bg-red-50'     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-6 w-8 rounded bg-[var(--color-cream-dark)] animate-pulse mb-1" />
                ) : (
                  <p className="text-xl font-bold text-[var(--color-slate)]">{value}</p>
                )}
                <p className="text-xs text-[var(--color-text-faint)]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by carrier, coverage, equipment or rate type…"
              className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
            />
          </div>
          <div className="flex rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-1 gap-0.5">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === value
                    ? 'bg-[var(--color-slate)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-[var(--color-cream-dark)]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-cream-dark)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-36 rounded bg-[var(--color-cream-dark)]" />
                    <div className="h-3 w-24 rounded bg-[var(--color-cream)]" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-[var(--color-cream-dark)]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={32} className="text-[var(--color-cream-dark)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">No contracts found</p>
              <p className="text-xs text-[var(--color-text-faint)] mt-1">
                {search || filter !== 'all' ? 'Adjust the filter or search term' : 'Create your first contract to get started'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Carrier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Coverage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Valid to</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-[var(--color-cream-dark)] last:border-0 hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                    onClick={() => setSelected(contract)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-slate)] text-xs font-bold text-white">
                          {contract.carrierAvatar}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">{contract.carrier}</p>
                          <p className="text-xs text-[var(--color-text-faint)]">{contract.carrierCompany}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[var(--color-slate)]">{contract.rate}</p>
                      <p className="text-xs text-[var(--color-text-faint)]">{contract.rateType}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--color-text)]">{contract.equipmentType}</p>
                      {contract.maxWeight && (
                        <p className="text-xs text-[var(--color-text-faint)]">{contract.maxWeight} lbs max</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--color-text)]">{contract.coverage}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm ${contract.status === 'expired' ? 'text-red-500 font-semibold' : 'text-[var(--color-text)]'}`}>
                        {contract.validTo}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(contract)}
                        className="rounded-lg border border-[var(--color-cream-dark)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors flex items-center gap-1 ml-auto"
                      >
                        Open <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
