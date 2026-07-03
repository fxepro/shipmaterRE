'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown, RefreshCw, Search, ShieldCheck, Zap } from 'lucide-react';
import { adminOrgApi } from '@/lib/api';
import type { OrgAdmin } from '@/types/user';

// ── Stripe mode badge ─────────────────────────────────────────────────────────
function StripeBadge({ mode }: { mode: 'platform' | 'connect' }) {
  if (mode === 'connect') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ background: 'var(--info-bg)', color: 'var(--info)' }}
      >
        <Zap size={10} /> Own Stripe
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
    >
      <ShieldCheck size={10} /> Shipmater
    </span>
  );
}

// ── Stripe settings modal ─────────────────────────────────────────────────────
interface StripeModalProps {
  org: OrgAdmin;
  onClose: () => void;
}

function StripeModal({ org, onClose }: StripeModalProps) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'platform' | 'connect'>(org.stripe_mode);
  const [connectId, setConnectId] = useState(org.stripe_connect_id ?? '');
  const [rate, setRate] = useState(
    org.commission_rate !== null ? String((org.commission_rate * 100).toFixed(2)) : ''
  );
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof adminOrgApi.updateStripe>[1]) =>
      adminOrgApi.updateStripe(org.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orgs'] });
      onClose();
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      setError(e.response?.data?.message ?? 'Failed to update Stripe settings.');
    },
  });

  function handleSave() {
    setError('');
    if (mode === 'connect' && !connectId.trim()) {
      setError('Stripe Connect ID is required when using own Stripe.');
      return;
    }
    mutation.mutate({
      stripe_mode: mode,
      stripe_connect_id: mode === 'connect' ? connectId.trim() : null,
      commission_rate: rate !== '' ? parseFloat(rate) / 100 : null,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,46,64,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-md p-6 space-y-5" style={{ background: 'var(--card)' }}>
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--navy)' }}>
            Stripe Settings — {org.name}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Admin-only. Changes take effect on the next payment.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
            Payment mode
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['platform', 'connect'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="rounded-lg border px-3 py-3 text-left transition-all"
                style={{
                  borderColor: mode === m ? 'var(--primary)' : 'var(--border)',
                  background: mode === m ? 'var(--primary-soft)' : 'var(--surface)',
                  color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <p className="text-sm font-semibold capitalize">{m === 'platform' ? 'Shipmater' : 'Own Stripe'}</p>
                <p className="text-[11px] mt-0.5">
                  {m === 'platform'
                    ? 'All payments via Shipmater → maximises ARR'
                    : 'Enterprise: payments go to their Stripe'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Connect ID — only shown in connect mode */}
        {mode === 'connect' && (
          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Stripe Connect Account ID
            </label>
            <input
              className="input w-full text-sm"
              placeholder="acct_1ABC..."
              value={connectId}
              onChange={(e) => setConnectId(e.target.value)}
            />
            <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
              Found in the tenant's Stripe dashboard → Settings → Account details.
            </p>
          </div>
        )}

        {/* Commission rate */}
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Commission rate (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="input w-28 text-sm"
              placeholder={`${((org.effective_rate ?? 0.15) * 100).toFixed(1)} (default)`}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            Leave blank to use the platform default ({((org.effective_rate ?? 0.15) * 100).toFixed(1)}%).
          </p>
        </div>

        {error && (
          <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminOrgsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tenantsOnly, setTenantsOnly] = useState(false);
  const [editOrg, setEditOrg] = useState<OrgAdmin | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orgs', search, typeFilter, tenantsOnly],
    queryFn: () =>
      adminOrgApi.listOrgs({
        search: search || undefined,
        type: typeFilter || undefined,
        tenants_only: tenantsOnly || undefined,
      }),
  });

  const orgs: OrgAdmin[] = data?.data?.data ?? [];

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-2">
            <Building2 size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="page-title">Organizations</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="card card-body flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
            <input
              className="input w-full pl-8 text-sm"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="input pr-7 text-sm appearance-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option value="shipper">Shipper</option>
              <option value="carrier">Carrier</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={tenantsOnly}
              onChange={(e) => setTenantsOnly(e.target.checked)}
              className="rounded"
            />
            Platform tenants only
          </label>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Org', 'Type', 'Plan', 'Owner', 'Stripe mode', 'Rate', 'Tenant', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton h-4 rounded w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : orgs.map((org) => (
                      <tr
                        key={org.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        className="transition-colors hover:bg-[var(--surface)]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{org.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{org.slug}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize" style={{ color: 'var(--text-muted)' }}>{org.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize" style={{ color: 'var(--text-muted)' }}>{org.plan}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                          {org.owner?.name ?? '—'}
                          {org.owner?.email && (
                            <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{org.owner.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StripeBadge mode={org.stripe_mode} />
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                          {(org.effective_rate * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          {org.is_platform_tenant ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                            >
                              Tenant
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="btn text-xs py-1 px-3"
                            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
                            onClick={() => setEditOrg(org)}
                          >
                            Stripe ↗
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && orgs.length === 0 && (
              <div className="py-12 text-center" style={{ color: 'var(--text-faint)' }}>
                No organizations found.
              </div>
            )}
          </div>
        </div>
      </div>

      {editOrg && <StripeModal org={editOrg} onClose={() => setEditOrg(null)} />}
    </>
  );
}
