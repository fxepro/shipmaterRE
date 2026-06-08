'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Warehouse, Users, Star, X, Loader2,
  ChevronUp, ChevronDown, ChevronsUpDown, Clock, Phone,
  MapPin, Trash2, CheckCircle2, ArrowUpDown,
} from 'lucide-react';
import { locationApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type LocationType = 'pickup' | 'delivery' | 'both';
type ActiveTab    = 'pickup' | 'delivery';
type SortField    = 'name' | 'city' | 'usage_count' | 'last_used_at' | 'created_at';
type SortDir      = 'asc' | 'desc';

interface Location {
  id:               number;
  type:             LocationType;
  name:             string;
  contact_name:     string | null;
  contact_phone:    string | null;
  contact_email:    string | null;
  address:          string;
  city:             string;
  state:            string;
  zip:              string;
  lat:              number | null;
  lng:              number | null;
  operating_hours:  Record<string, string> | null;
  notes:            string | null;
  is_default:       boolean;
  usage_count:      number;
  last_used_at:     string | null;
  created_at:       string;
}

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun',
};

function fmtDate(val: string | null): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {
  if (field !== active) return <ChevronsUpDown size={12} className="opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp   size={12} className="text-[var(--color-teal)]" />
    : <ChevronDown size={12} className="text-[var(--color-teal)]" />;
}

// ── Location Panel ─────────────────────────────────────────────────────────────

function LocationPanel({
  location,
  defaultType,
  onClose,
}: {
  location: Location | 'new';
  defaultType: ActiveTab;
  onClose: () => void;
}) {
  const qc    = useQueryClient();
  const isNew = location === 'new';
  const init  = isNew ? null : (location as Location);

  const [form, setForm] = useState({
    type:          (init?.type          ?? defaultType) as LocationType,
    name:          init?.name          ?? '',
    contact_name:  init?.contact_name  ?? '',
    contact_phone: init?.contact_phone ?? '',
    contact_email: init?.contact_email ?? '',
    address:       init?.address       ?? '',
    city:          init?.city          ?? '',
    state:         init?.state         ?? '',
    zip:           init?.zip           ?? '',
    notes:         init?.notes         ?? '',
    is_default:    init?.is_default    ?? false,
    hours: DAYS.reduce((acc, d) => ({
      ...acc, [d]: init?.operating_hours?.[d] ?? '',
    }), {} as Record<string, string>),
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const set   = (k: keyof typeof form) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));
  const setHr = (d: string, v: string) =>
    setForm(f => ({ ...f, hours: { ...f.hours, [d]: v } }));

  const saveMutation = useMutation({
    mutationFn: () => {
      const hours = Object.fromEntries(Object.entries(form.hours).filter(([, v]) => v.trim()));
      const payload = {
        type: form.type, name: form.name,
        contact_name:  form.contact_name  || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        address: form.address, city: form.city, state: form.state, zip: form.zip,
        notes: form.notes || null, is_default: form.is_default,
        operating_hours: Object.keys(hours).length ? hours : null,
      };
      return isNew
        ? locationApi.create(payload)
        : locationApi.update(init!.id, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); onClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => locationApi.destroy(init!.id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['locations'] }); onClose(); },
  });

  const valid = form.name && form.address && form.city && form.state && form.zip;

  const inputCls = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20';
  const labelCls = 'block mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]';
  const SH = ({ t }: { t: string }) => (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-teal)] border-b border-[var(--color-cream-dark)] pb-1.5 mb-3 mt-1">{t}</p>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-1/2 min-w-[520px] bg-[var(--color-cream)] shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)]">
          <div>
            <p className="text-base font-semibold text-[var(--color-text)]">
              {isNew ? 'Add location' : init!.name}
            </p>
            {!isNew && (
              <p className="text-xs text-[var(--color-text-faint)] mt-0.5 capitalize">
                {init!.type} · Used {init!.usage_count}×
                {init!.last_used_at && ` · Last used ${fmtDate(init!.last_used_at)}`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <SH t="Type" />
          <div className="flex gap-2">
            {(['pickup','delivery','both'] as LocationType[]).map(t => (
              <button key={t} onClick={() => set('type')(t)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all ${
                  form.type === t
                    ? 'bg-[var(--color-teal)] text-white border-[var(--color-teal)]'
                    : 'border-[var(--color-cream-dark)] bg-[var(--color-white)] text-[var(--color-text-muted)] hover:border-[var(--color-teal)]'
                }`}>
                {t === 'pickup' ? 'Pickup' : t === 'delivery' ? 'Delivery' : 'Both'}
              </button>
            ))}
          </div>

          <SH t="Name" />
          <input value={form.name} onChange={e => set('name')(e.target.value)}
            placeholder={form.type === 'pickup' ? 'e.g. Chicago Warehouse A' : 'e.g. Milwaukee Customer'}
            className={inputCls} />

          <SH t="Address" />
          <input value={form.address} onChange={e => set('address')(e.target.value)}
            placeholder="Street address" className={inputCls} />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className={labelCls}>City</label>
              <input value={form.city} onChange={e => set('city')(e.target.value)} placeholder="Chicago" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input value={form.state} onChange={e => set('state')(e.target.value.toUpperCase().slice(0,2))} placeholder="IL" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ZIP</label>
              <input value={form.zip} onChange={e => set('zip')(e.target.value)} placeholder="60601" className={inputCls} />
            </div>
          </div>

          <SH t="Contact" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name <span className="normal-case font-normal opacity-60">optional</span></label>
              <input value={form.contact_name} onChange={e => set('contact_name')(e.target.value)} placeholder="Dock manager" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone <span className="normal-case font-normal opacity-60">optional</span></label>
              <input value={form.contact_phone} onChange={e => set('contact_phone')(e.target.value)} placeholder="+1 312 555 0100" className={inputCls} />
            </div>
          </div>

          <SH t="Operating Hours" />
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="text-center">
                <p className="text-[10px] font-semibold text-[var(--color-text-faint)] mb-1">{DAY_LABELS[d]}</p>
                <input value={form.hours[d]} onChange={e => setHr(d, e.target.value)}
                  placeholder="08-17"
                  className="w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-1 py-1.5 text-[10px] text-center focus:border-[var(--color-teal)] focus:outline-none" />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--color-text-faint)]">Format: 08-17 or 08:00-17:00</p>

          <SH t="Notes" />
          <textarea value={form.notes} onChange={e => set('notes')(e.target.value)}
            rows={3} placeholder="Gate code, dock instructions, call-ahead requirements…"
            className={`${inputCls} resize-none`} />

          {/* Default */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Set as default</p>
              <p className="text-xs text-[var(--color-text-faint)]">Pre-selected when building jobs</p>
            </div>
            <button role="switch" aria-checked={form.is_default}
              onClick={() => set('is_default')(!form.is_default)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                form.is_default ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]'
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                form.is_default ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-4">
          {!isNew && confirmDelete ? (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="flex-1 text-sm text-red-700 font-medium">Delete this location?</p>
              <button onClick={() => setConfirmDelete(false)} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-semibold">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {!isNew && (
                <button onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--color-cream-dark)] px-3.5 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-red-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              )}
              <button onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors">
                Cancel
              </button>
              <button onClick={() => saveMutation.mutate()}
                disabled={!valid || saveMutation.isPending}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  valid && !saveMutation.isPending
                    ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                    : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
                }`}>
                {saveMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                {isNew ? 'Add location' : 'Save changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'created_at',  label: 'Recently added'  },
  { value: 'last_used_at',label: 'Recently used'   },
  { value: 'usage_count', label: 'Most used'        },
  { value: 'name',        label: 'Name A–Z'         },
  { value: 'city',        label: 'City A–Z'         },
];

const COL_HEADERS: { field: SortField; label: string; cls: string }[] = [
  { field: 'name',         label: 'Name',        cls: 'w-[28%]'  },
  { field: 'city',         label: 'Location',    cls: 'w-[18%]'  },
  { field: 'name',         label: 'Contact',     cls: 'w-[18%]'  }, // not sortable, uses name field as placeholder
  { field: 'usage_count',  label: 'Used',        cls: 'w-[8%] text-right'  },
  { field: 'last_used_at', label: 'Last used',   cls: 'w-[13%]' },
  { field: 'created_at',   label: 'Added',       cls: 'w-[11%]' },
];

export default function LocationsPage() {
  const qc     = useQueryClient();
  const params = useSearchParams();

  const initTab = (params.get('type') === 'delivery' ? 'delivery' : 'pickup') as ActiveTab;
  const [activeTab, setActiveTab] = useState<ActiveTab>(initTab);
  const [search,    setSearch]    = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [panel,     setPanel]     = useState<Location | 'new' | null>(null);

  useEffect(() => {
    const t = params.get('type');
    if (t === 'delivery') setActiveTab('delivery');
    else if (t === 'pickup') setActiveTab('pickup');
  }, [params]);

  const { data: res, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn:  () => locationApi.list(),
  });

  const all: Location[] = res?.data?.data ?? [];

  const rows = useMemo(() => {
    let list = all.filter(loc => {
      const matchTab    = loc.type === activeTab || loc.type === 'both';
      const matchSearch = !search || [loc.name, loc.city, loc.state, loc.address, loc.contact_name]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()));
      return matchTab && matchSearch;
    });

    list = [...list].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';

      if (sortField === 'name')         { va = a.name.toLowerCase();     vb = b.name.toLowerCase(); }
      if (sortField === 'city')         { va = a.city.toLowerCase();     vb = b.city.toLowerCase(); }
      if (sortField === 'usage_count')  { va = a.usage_count;            vb = b.usage_count; }
      if (sortField === 'last_used_at') { va = a.last_used_at ?? '';     vb = b.last_used_at ?? ''; }
      if (sortField === 'created_at')   { va = a.created_at;             vb = b.created_at; }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

    return list;
  }, [all, activeTab, search, sortField, sortDir]);

  const pickupCount   = all.filter(l => l.type === 'pickup'   || l.type === 'both').length;
  const deliveryCount = all.filter(l => l.type === 'delivery' || l.type === 'both').length;

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const thCls = (field: SortField, extra = '') =>
    `px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] cursor-pointer select-none hover:text-[var(--color-text)] transition-colors ${extra}`;

  return (
    <>
      {panel !== null && (
        <LocationPanel
          location={panel}
          defaultType={activeTab}
          onClose={() => setPanel(null)}
        />
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
              Locations
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
              Saved pickup and delivery addresses — reused across all jobs
            </p>
          </div>
          <button
            onClick={() => setPanel('new')}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors"
          >
            <Plus size={15} /> Add location
          </button>
        </div>

        {/* Toolbar: tabs + search + sort */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Tabs */}
          <div className="flex items-center gap-0.5 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-1">
            {([
              { key: 'pickup'   as ActiveTab, label: 'Pickup',   icon: Warehouse, count: pickupCount   },
              { key: 'delivery' as ActiveTab, label: 'Delivery', icon: Users,     count: deliveryCount },
            ]).map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  activeTab === key
                    ? 'bg-[var(--color-slate)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}>
                <Icon size={13} />
                {label}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === key ? 'bg-white/20 text-white' : 'bg-[var(--color-cream)] text-[var(--color-text-faint)]'
                }`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, city, contact…"
              className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-9 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20" />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown size={13} className="text-[var(--color-text-faint)]" />
            <select
              value={`${sortField}:${sortDir}`}
              onChange={e => {
                const [f, d] = e.target.value.split(':') as [SortField, SortDir];
                setSortField(f); setSortDir(d);
              }}
              className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none appearance-none pr-8 cursor-pointer"
            >
              <option value="created_at:desc">Recently added</option>
              <option value="last_used_at:desc">Recently used</option>
              <option value="usage_count:desc">Most used</option>
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
              <option value="city:asc">City A–Z</option>
            </select>
          </div>

          {/* Row count */}
          <p className="text-xs text-[var(--color-text-faint)] whitespace-nowrap">
            {rows.length} {rows.length === 1 ? 'location' : 'locations'}
          </p>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-[var(--color-cream-dark)]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-cream-dark)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 rounded bg-[var(--color-cream-dark)]" />
                    <div className="h-3 w-24 rounded bg-[var(--color-cream)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin size={30} className="text-[var(--color-cream-dark)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                {search ? 'No locations match your search' : `No ${activeTab} addresses yet`}
              </p>
              {!search && (
                <button onClick={() => setPanel('new')}
                  className="mt-3 text-sm font-semibold text-[var(--color-teal)] hover:underline">
                  Add the first one
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  {/* Icon col */}
                  <th className="w-12 px-4 py-3" />

                  <th onClick={() => toggleSort('name')}
                    className={thCls('name', 'w-[28%]')}>
                    <span className="flex items-center gap-1.5">
                      Name <SortIcon field="name" active={sortField} dir={sortDir} />
                    </span>
                  </th>

                  <th onClick={() => toggleSort('city')}
                    className={thCls('city', 'w-[15%]')}>
                    <span className="flex items-center gap-1.5">
                      Location <SortIcon field="city" active={sortField} dir={sortDir} />
                    </span>
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] w-[20%]">
                    Contact
                  </th>

                  <th onClick={() => toggleSort('usage_count')}
                    className={thCls('usage_count', 'w-[8%] text-center')}>
                    <span className="flex items-center justify-center gap-1.5">
                      Used <SortIcon field="usage_count" active={sortField} dir={sortDir} />
                    </span>
                  </th>

                  <th onClick={() => toggleSort('last_used_at')}
                    className={thCls('last_used_at', 'w-[14%] text-center')}>
                    <span className="flex items-center justify-center gap-1.5">
                      Last used <SortIcon field="last_used_at" active={sortField} dir={sortDir} />
                    </span>
                  </th>

                  <th onClick={() => toggleSort('created_at')}
                    className={thCls('created_at', 'w-[13%] text-center')}>
                    <span className="flex items-center justify-center gap-1.5">
                      Added <SortIcon field="created_at" active={sortField} dir={sortDir} />
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map(loc => (
                  <tr
                    key={loc.id}
                    onClick={() => setPanel(loc)}
                    className="border-b border-[var(--color-cream-dark)] last:border-0 hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                  >
                    {/* Type icon */}
                    <td className="px-4 py-3.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-teal-pale)]">
                        {loc.type !== 'delivery'
                          ? <Warehouse size={14} className="text-[var(--color-teal)]" />
                          : <Users     size={14} className="text-[var(--color-teal)]" />
                        }
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--color-text)] truncate max-w-[220px]">{loc.name}</p>
                        {loc.is_default && (
                          <Star size={11} className="shrink-0 text-amber-500 fill-amber-400" />
                        )}
                        {loc.type === 'both' && (
                          <span className="shrink-0 text-[10px] bg-[var(--color-cream)] text-[var(--color-text-faint)] rounded-full px-1.5 py-0.5 font-semibold">Both</span>
                        )}
                      </div>
                      {loc.notes && (
                        <p className="text-xs text-[var(--color-text-faint)] truncate max-w-[220px] mt-0.5 italic">{loc.notes}</p>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5">
                      <p className="text-[var(--color-text)]">{loc.city}, {loc.state}</p>
                      <p className="text-xs text-[var(--color-text-faint)] truncate max-w-[150px]">{loc.address}</p>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      {loc.contact_name
                        ? <>
                            <p className="text-[var(--color-text)]">{loc.contact_name}</p>
                            {loc.contact_phone && (
                              <p className="text-xs text-[var(--color-text-faint)]">{loc.contact_phone}</p>
                            )}
                          </>
                        : <span className="text-[var(--color-text-faint)]">—</span>
                      }
                    </td>

                    {/* Used */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-semibold tabular-nums ${loc.usage_count > 0 ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-faint)]'}`}>
                        {loc.usage_count}
                      </span>
                    </td>

                    {/* Last used */}
                    <td className="px-4 py-3.5 text-xs text-center text-[var(--color-text-faint)]">
                      {fmtDate(loc.last_used_at)}
                    </td>

                    {/* Added */}
                    <td className="px-4 py-3.5 text-xs text-center text-[var(--color-text-faint)]">
                      {fmtDate(loc.created_at)}
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
