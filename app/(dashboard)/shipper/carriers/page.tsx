'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferredCarrierApi, carrierApi } from '@/lib/api';
import {
  Truck, Star, Search, Plus, X, Shield, Hash,
  CheckCircle2, Clock, Package, ChevronRight, Trash2,
  Phone, Mail, MapPin, Loader2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Carrier {
  id: number;
  carrierId: number;
  name: string;
  company: string;
  dot: string;
  mc: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  reviews: number;
  completedTogether: number;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
  joinedDate: string;
  insuranceVerified: boolean;
}

interface CarrierPreview {
  name: string;
  company: string;
  dot: string;
  mc: string;
  rating: number;
  reviews: number;
  insuranceVerified: boolean;
  avatar: string;
}

// ── Transforms ────────────────────────────────────────────────────────────────

function toCarrier(r: any): Carrier {
  return {
    id:                r.id,
    carrierId:         r.carrier_id,
    name:              r.name,
    company:           r.company ?? '',
    dot:               r.dot ?? '',
    mc:                r.mc ?? '',
    email:             r.email ?? '',
    phone:             r.phone ?? '',
    location:          r.location ?? '',
    rating:            r.rating ?? 0,
    reviews:           r.reviews ?? 0,
    completedTogether: r.completed_together ?? 0,
    status:            r.status as Carrier['status'],
    avatar:            r.avatar ?? '',
    joinedDate:        r.joined_date ?? '',
    insuranceVerified: r.insurance_verified ?? false,
  };
}

function toPreview(r: any): CarrierPreview {
  return {
    name:             r.name ?? '',
    company:          r.company_name ?? '',
    dot:              r.dot_number ?? '',
    mc:               r.mc_number ?? '',
    rating:           r.rating ?? 0,
    reviews:          r.reviews ?? 0,
    insuranceVerified: r.insurance_verified ?? false,
    avatar:           r.avatar ?? '',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-cream-dark)]'}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: Carrier['status'] }) {
  const map = {
    active:   'bg-emerald-50 text-emerald-700',
    pending:  'bg-amber-50 text-amber-700',
    inactive: 'bg-[var(--color-cream)] text-[var(--color-text-faint)]',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

// ── Add Carrier Modal ─────────────────────────────────────────────────────────

function AddCarrierModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [dot, setDot]             = useState('');
  const [preview, setPreview]     = useState<CarrierPreview | null>(null);
  const [searched, setSearched]   = useState(false);
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleSearch = async () => {
    if (dot.length < 5) return;
    setSearching(true);
    setSearched(false);
    setPreview(null);
    setLookupError('');
    try {
      const res  = await carrierApi.lookup(dot);
      const list = res.data.data as any[];
      if (list.length === 0) {
        setLookupError(`No carrier found for DOT# ${dot}. Make sure they're registered on Shipmater.`);
      } else {
        setPreview(toPreview(list[0]));
      }
    } catch {
      setLookupError('Search failed. Please try again.');
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const addMutation = useMutation({
    mutationFn: () => preferredCarrierApi.add({ dot_number: dot }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferred-carriers'] });
      onClose();
    },
    onError: (err: any) => {
      setLookupError(err?.response?.data?.message ?? 'Failed to add carrier.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[var(--color-text)]">Add preferred carrier</h3>
          <button onClick={onClose} className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-[var(--color-text-faint)]">
          Search by FMCSA DOT number to find and add a carrier to your preferred network.
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <input
              value={dot}
              onChange={(e) => {
                setDot(e.target.value.replace(/\D/g, ''));
                setSearched(false);
                setPreview(null);
                setLookupError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 3841922"
              className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-9 pr-3.5 py-2.5 text-sm font-mono focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={dot.length < 5 || searching}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
              dot.length >= 5 && !searching
                ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)]'
                : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
            }`}
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : null}
            Search
          </button>
        </div>

        {searched && lookupError && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {lookupError}
          </div>
        )}

        {!searched && lookupError && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {lookupError}
          </div>
        )}

        {preview && (
          <div className="mt-4 rounded-xl border border-[var(--color-teal)] bg-[var(--color-teal-pale)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-slate)] text-sm font-bold text-white">
                {preview.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{preview.name}</p>
                <p className="text-xs text-[var(--color-text-faint)]">{preview.company} · DOT {preview.dot}</p>
              </div>
              {preview.insuranceVerified && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Shield size={11} /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-faint)]">
              <Stars rating={preview.rating} />
              <span>{preview.rating.toFixed(1)} · {preview.reviews} reviews</span>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => addMutation.mutate()}
            disabled={!preview || addMutation.isPending}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              preview && !addMutation.isPending
                ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm'
                : 'bg-[var(--color-cream-dark)] text-[var(--color-text-faint)] cursor-not-allowed'
            }`}
          >
            {addMutation.isPending && <Loader2 size={13} className="animate-spin" />}
            Add to network
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carrier Detail Drawer ─────────────────────────────────────────────────────

function CarrierDrawer({ carrier, onClose }: { carrier: Carrier; onClose: () => void }) {
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
          <p className="text-base font-semibold text-[var(--color-text)]">Carrier profile</p>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Identity */}
        <div className="p-5 border-b border-[var(--color-cream-dark)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-slate)] text-xl font-bold text-white">
              {carrier.avatar}
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--color-text)]">{carrier.name}</p>
              <p className="text-sm text-[var(--color-text-faint)]">{carrier.company}</p>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={carrier.rating} />
                <span className="text-xs text-[var(--color-text-faint)]">
                  {carrier.rating.toFixed(1)} ({carrier.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={carrier.status} />
            {carrier.insuranceVerified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <Shield size={10} /> Insured & verified
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3 border-b border-[var(--color-cream-dark)]">
          {[
            { icon: Hash,   label: 'DOT Number',   value: carrier.dot   },
            { icon: Hash,   label: 'MC Number',    value: carrier.mc    },
            { icon: Mail,   label: 'Email',         value: carrier.email },
            { icon: Phone,  label: 'Phone',         value: carrier.phone || '—' },
            { icon: MapPin, label: 'Base location', value: carrier.location || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={13} className="text-[var(--color-teal)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-faint)]">{label}</p>
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-5 border-b border-[var(--color-cream-dark)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
            With your business
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--color-cream)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--color-slate)]">{carrier.completedTogether}</p>
              <p className="text-xs text-[var(--color-text-faint)]">Shipments completed</p>
            </div>
            <div className="rounded-xl bg-[var(--color-cream)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--color-slate)]">{carrier.reviews}</p>
              <p className="text-xs text-[var(--color-text-faint)]">Platform reviews</p>
            </div>
          </div>
        </div>

        {/* Joined */}
        {carrier.joinedDate && (
          <div className="px-5 py-3 border-b border-[var(--color-cream-dark)]">
            <p className="text-xs text-[var(--color-text-faint)]">
              Member since <span className="font-semibold text-[var(--color-text)]">{carrier.joinedDate}</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-5 space-y-2">
          <button className="w-full rounded-xl bg-[var(--color-teal)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] transition-colors shadow-sm">
            Assign to shipment
          </button>
          <button className="w-full rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
            Create contract
          </button>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShipperCarriersPage() {
  const qc = useQueryClient();
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [selected, setSelected] = useState<Carrier | null>(null);

  const { data: carriers = [], isLoading } = useQuery<Carrier[]>({
    queryKey: ['preferred-carriers'],
    queryFn:  () =>
      preferredCarrierApi.list().then((r) => (r.data.data as any[]).map(toCarrier)),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => preferredCarrierApi.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['preferred-carriers'] });
      if (selected?.id === id) setSelected(null);
    },
  });

  const filtered = carriers.filter((c) =>
    [c.name, c.company, c.dot, c.location].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  );

  const stats = {
    total:    carriers.length,
    active:   carriers.filter((c) => c.status === 'active').length,
    verified: carriers.filter((c) => c.insuranceVerified).length,
  };

  return (
    <>
      {showAdd && <AddCarrierModal onClose={() => setShowAdd(false)} />}
      {selected && <CarrierDrawer carrier={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl text-[var(--color-slate)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Preferred Carriers
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
              Your trusted carrier network — assign them directly to shipments
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] shadow-sm transition-colors"
          >
            <Plus size={15} /> Add carrier
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total carriers',     value: stats.total,    icon: Truck,        color: 'text-[var(--color-teal)]', bg: 'bg-[var(--color-teal-pale)]' },
            { label: 'Active',             value: stats.active,   icon: CheckCircle2, color: 'text-emerald-600',         bg: 'bg-emerald-50'               },
            { label: 'Insurance verified', value: stats.verified, icon: Shield,       color: 'text-blue-600',            bg: 'bg-blue-50'                  },
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

        {/* Search */}
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, DOT# or city…"
            className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
          />
        </div>

        {/* Carrier list */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-[var(--color-cream-dark)]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-[var(--color-cream-dark)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 rounded bg-[var(--color-cream-dark)]" />
                    <div className="h-3 w-28 rounded bg-[var(--color-cream)]" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-[var(--color-cream-dark)]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Truck size={32} className="text-[var(--color-cream-dark)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">No carriers found</p>
              <p className="text-xs text-[var(--color-text-faint)] mt-1">
                {search ? 'Try a different search term' : 'Add your first carrier to get started'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Carrier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">DOT / MC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Shipments</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((carrier, idx) => (
                  <tr
                    key={carrier.id}
                    className={`border-b border-[var(--color-cream-dark)] last:border-0 hover:bg-[var(--color-cream)] transition-colors cursor-pointer ${idx % 2 !== 0 ? 'bg-[var(--color-cream)]/30' : ''}`}
                    onClick={() => setSelected(carrier)}
                  >
                    {/* Identity */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-slate)] text-xs font-bold text-white">
                          {carrier.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">{carrier.name}</p>
                          <p className="text-xs text-[var(--color-text-faint)]">
                            {carrier.company}{carrier.location ? ` · ${carrier.location}` : ''}
                          </p>
                        </div>
                        {carrier.insuranceVerified && (
                          <span title="Verified"><Shield size={12} className="text-emerald-500 shrink-0" /></span>
                        )}
                      </div>
                    </td>
                    {/* DOT */}
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs text-[var(--color-text)]">{carrier.dot}</p>
                      <p className="font-mono text-xs text-[var(--color-text-faint)]">{carrier.mc}</p>
                    </td>
                    {/* Rating */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <Stars rating={carrier.rating} />
                        <span className="text-xs text-[var(--color-text-faint)]">
                          {carrier.rating.toFixed(1)} ({carrier.reviews})
                        </span>
                      </div>
                    </td>
                    {/* Shipments together */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Package size={12} className="text-[var(--color-teal)]" />
                        <span className="font-semibold text-[var(--color-text)]">{carrier.completedTogether}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={carrier.status} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setSelected(carrier)}
                          className="rounded-lg border border-[var(--color-cream-dark)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors flex items-center gap-1"
                        >
                          View <ChevronRight size={11} />
                        </button>
                        <button
                          onClick={() => removeMutation.mutate(carrier.id)}
                          disabled={removeMutation.isPending}
                          className="rounded-lg p-1.5 text-[var(--color-text-faint)] hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Remove from network"
                        >
                          {removeMutation.isPending && removeMutation.variables === carrier.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invite CTA */}
        <div className="rounded-2xl border border-dashed border-[var(--color-cream-dark)] p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-cream)] text-[var(--color-teal)]">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Know a reliable carrier?</p>
              <p className="text-xs text-[var(--color-text-faint)]">
                Invite them to Shipmater and they&apos;ll appear here automatically.
              </p>
            </div>
          </div>
          <button className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[var(--color-cream-dark)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
            <Plus size={13} /> Send invite
          </button>
        </div>
      </div>
    </>
  );
}
