'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, Plus, X, Search, ChevronDown, Warehouse, Users,
  Phone, Mail, Clock, Pencil, Trash2, Loader2, Star,
} from 'lucide-react';
import { locationApi } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type LocationType = 'pickup' | 'delivery' | 'both';
type ActiveTab    = 'pickup' | 'delivery';

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
}

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun',
};

// ── Location Form Modal ───────────────────────────────────────────────────────

function LocationModal({
  initial,
  defaultType,
  onClose,
}: {
  initial?: Location;
  defaultType: ActiveTab;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    type:          initial?.type          ?? defaultType,
    name:          initial?.name          ?? '',
    contact_name:  initial?.contact_name  ?? '',
    contact_phone: initial?.contact_phone ?? '',
    contact_email: initial?.contact_email ?? '',
    address:       initial?.address       ?? '',
    city:          initial?.city          ?? '',
    state:         initial?.state         ?? '',
    zip:           initial?.zip           ?? '',
    notes:         initial?.notes         ?? '',
    is_default:    initial?.is_default    ?? false,
    hours: DAYS.reduce((acc, d) => ({
      ...acc,
      [d]: initial?.operating_hours?.[d] ?? '',
    }), {} as Record<string, string>),
  });

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const setHour = (day: string, val: string) =>
    setForm(f => ({ ...f, hours: { ...f.hours, [day]: val } }));

  const saveMutation = useMutation({
    mutationFn: () => {
      const hours = Object.fromEntries(
        Object.entries(form.hours).filter(([, v]) => v.trim())
      );
      const payload = {
        type:          form.type,
        name:          form.name,
        contact_name:  form.contact_name  || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        address:       form.address,
        city:          form.city,
        state:         form.state,
        zip:           form.zip,
        notes:         form.notes || null,
        is_default:    form.is_default,
        operating_hours: Object.keys(hours).length ? hours : null,
      };
      return isEdit
        ? locationApi.update(initial!.id, payload)
        : locationApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      onClose();
    },
  });

  const valid = form.name && form.address && form.city && form.state && form.zip;

  const inputCls = 'w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20';
  const labelCls = 'block mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[var(--color-white)] shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-cream-dark)]">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            {isEdit ? 'Edit location' : 'Add location'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Type */}
          <div>
            <label className={labelCls}>Location type</label>
            <div className="flex gap-2">
              {(['pickup','delivery','both'] as LocationType[]).map(t => (
                <button
                  key={t}
                  onClick={() => set('type')(t)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all ${
                    form.type === t
                      ? 'bg-[var(--color-teal)] text-white border-[var(--color-teal)]'
                      : 'border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-teal)]'
                  }`}
                >
                  {t === 'pickup' ? 'Warehouse / Pickup' : t === 'delivery' ? 'Customer / Delivery' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Location name</label>
            <input value={form.name} onChange={e => set('name')(e.target.value)}
              placeholder={form.type === 'pickup' ? 'e.g. Chicago Warehouse A' : 'e.g. Milwaukee Customer'}
              className={inputCls} />
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <input value={form.address} onChange={e => set('address')(e.target.value)}
              placeholder="Street address" className={inputCls} />
          </div>
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

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Contact name <span className="normal-case font-normal opacity-60">optional</span></label>
              <input value={form.contact_name} onChange={e => set('contact_name')(e.target.value)}
                placeholder="Dock manager" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone <span className="normal-case font-normal opacity-60">optional</span></label>
              <input value={form.contact_phone} onChange={e => set('contact_phone')(e.target.value)}
                placeholder="+1 312 555 0100" className={inputCls} />
            </div>
          </div>

          {/* Operating hours */}
          <div>
            <label className={labelCls}>Operating hours <span className="normal-case font-normal opacity-60">optional</span></label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(d => (
                <div key={d} className="text-center">
                  <p className="text-[10px] font-semibold text-[var(--color-text-faint)] mb-1">{DAY_LABELS[d]}</p>
                  <input
                    value={form.hours[d]}
                    onChange={e => setHour(d, e.target.value)}
                    placeholder="08-17"
                    className="w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-1 py-1.5 text-[10px] text-center focus:border-[var(--color-teal)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-text-faint)]">Format: 08-17 or 08:00-17:00</p>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Dock instructions / notes <span className="normal-case font-normal opacity-60">optional</span></label>
            <textarea value={form.notes} onChange={e => set('notes')(e.target.value)}
              rows={2} placeholder="e.g. Use Gate B, call ahead 30 min"
              className={`${inputCls} resize-none`} />
          </div>

          {/* Default toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">Set as default</p>
              <p className="text-xs text-[var(--color-text-faint)]">Pre-selected when building jobs</p>
            </div>
            <button
              role="switch"
              aria-checked={form.is_default}
              onClick={() => set('is_default')(!form.is_default)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                form.is_default ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-cream-dark)]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                form.is_default ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!valid || saveMutation.isPending}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              valid && !saveMutation.isPending
                ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
            }`}
          >
            {saveMutation.isPending && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Add location'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Location Card ─────────────────────────────────────────────────────────────

function LocationCard({
  loc,
  onEdit,
  onDelete,
  deleting,
}: {
  loc: Location;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="bg-[var(--color-white)] rounded-xl border border-[var(--color-cream-dark)] p-4 flex gap-4 group hover:border-[var(--color-teal)] transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-teal-pale)]">
        {loc.type === 'pickup' || loc.type === 'both'
          ? <Warehouse size={18} className="text-[var(--color-teal)]" />
          : <Users size={18} className="text-[var(--color-teal)]" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[var(--color-text)] truncate">{loc.name}</p>
          {loc.is_default && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">
              <Star size={8} /> Default
            </span>
          )}
          {loc.type === 'both' && (
            <span className="shrink-0 text-[10px] font-semibold bg-[var(--color-cream)] text-[var(--color-text-muted)] rounded-full px-2 py-0.5">
              Pickup + Delivery
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {loc.address}, {loc.city}, {loc.state} {loc.zip}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[var(--color-text-faint)]">
          {loc.contact_name  && <span className="flex items-center gap-1"><Users size={10} />{loc.contact_name}</span>}
          {loc.contact_phone && <span className="flex items-center gap-1"><Phone size={10} />{loc.contact_phone}</span>}
          {loc.operating_hours && Object.keys(loc.operating_hours).length > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {Object.entries(loc.operating_hours).slice(0, 2).map(([d, h]) => `${DAY_LABELS[d]} ${h}`).join(', ')}
              {Object.keys(loc.operating_hours).length > 2 && '…'}
            </span>
          )}
          {loc.usage_count > 0 && (
            <span className="text-[var(--color-teal)]">Used {loc.usage_count}×</span>
          )}
        </div>
        {loc.notes && (
          <p className="mt-1.5 text-xs text-[var(--color-text-faint)] italic truncate">{loc.notes}</p>
        )}
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-teal)] transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-[var(--color-text-faint)] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pickup');
  const [search, setSearch]       = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState<Location | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn:  () => locationApi.list(),
  });

  const all: Location[] = res?.data?.data ?? [];

  const filtered = all.filter(loc => {
    const matchTab = loc.type === activeTab || loc.type === 'both';
    const matchSearch = !search || [loc.name, loc.city, loc.address].some(
      f => f?.toLowerCase().includes(search.toLowerCase())
    );
    return matchTab && matchSearch;
  });

  const pickupCount   = all.filter(l => l.type === 'pickup'   || l.type === 'both').length;
  const deliveryCount = all.filter(l => l.type === 'delivery' || l.type === 'both').length;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationApi.destroy(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });

  return (
    <>
      {(showAdd || editing) && (
        <LocationModal
          initial={editing ?? undefined}
          defaultType={activeTab}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
              Locations
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
              Saved warehouses and customer addresses — reusable across all jobs
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors"
          >
            <Plus size={15} /> Add location
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-1 w-fit">
          {([
            { key: 'pickup'   as ActiveTab, label: 'Warehouses', icon: Warehouse, count: pickupCount   },
            { key: 'delivery' as ActiveTab, label: 'Customers',  icon: Users,     count: deliveryCount },
          ]).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-[var(--color-slate)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon size={14} />
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === key ? 'bg-white/20 text-white' : 'bg-[var(--color-cream)] text-[var(--color-text-faint)]'
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'pickup' ? 'warehouses' : 'customers'}…`}
            className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-[var(--color-cream)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-cream-dark)] py-16 text-center">
            <MapPin size={32} className="text-[var(--color-cream-dark)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              {search ? 'No locations match your search' : `No ${activeTab === 'pickup' ? 'warehouses' : 'customers'} yet`}
            </p>
            {!search && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-3 text-sm font-semibold text-[var(--color-teal)] hover:underline"
              >
                Add your first {activeTab === 'pickup' ? 'warehouse' : 'customer'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(loc => (
              <LocationCard
                key={loc.id}
                loc={loc}
                onEdit={() => setEditing(loc)}
                onDelete={() => deleteMutation.mutate(loc.id)}
                deleting={deleteMutation.isPending && deleteMutation.variables === loc.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
