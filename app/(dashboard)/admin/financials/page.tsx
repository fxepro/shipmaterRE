'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, ArrowDownCircle, Clock,
  Download, Search, Filter, ChevronDown, FileText,
} from 'lucide-react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FinancialSummary {
  total_revenue:   number;
  platform_fees:   number;
  carrier_payouts: number;
  pending:         number;
  job_count:       number;
}

interface FinancialRow {
  id:               number;
  title:            string;
  reference:        string | null;
  invoice_number:   string | null;
  status:           string;
  payment_status:   string | null;
  shipper:          string | null;
  carrier:          string | null;
  shipper_total:    number | null;
  platform_fee:     number | null;
  carrier_payout:   number | null;
  invoice_date:     string | null;
  invoice_due_date: string | null;
  created_at:       string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(val: number | null | undefined): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadge(s: string | null) {
  if (!s) return null;
  const map: Record<string, string> = {
    paid:       'bg-emerald-100 text-emerald-700',
    completed:  'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    pending:    'bg-amber-100 text-amber-700',
    unpaid:     'bg-red-100 text-red-700',
    failed:     'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[s] ?? 'bg-gray-100 text-gray-700'}`}>
      {s}
    </span>
  );
}

// ── Summary Card ──────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-faint)]">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminFinancialsPage() {
  const [from,   setFrom]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
  });
  const [to,     setTo]     = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const qp = new URLSearchParams({ from, to, ...(status !== 'all' && { status }) });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-financials', from, to, status],
    queryFn:  () => api.get(`/api/v1/admin/financials?${qp}`).then(r => r.data.data),
    staleTime: 60_000,
  });

  const summary: FinancialSummary = data?.summary ?? { total_revenue: 0, platform_fees: 0, carrier_payouts: 0, pending: 0, job_count: 0 };
  const rows: FinancialRow[]      = data?.rows     ?? [];

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.reference?.toLowerCase().includes(q) ||
      r.invoice_number?.toLowerCase().includes(q) ||
      r.shipper?.toLowerCase().includes(q) ||
      r.carrier?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  function exportCsv() {
    const url = `/api/v1/admin/financials/export?${qp}`;
    // Open via API client to include the auth token cookie
    window.location.href = url;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            Financial Reporting
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
            Platform revenue, fees, and carrier payouts
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5">
          <Filter size={13} className="text-[var(--color-text-faint)]" />
          <label className="text-xs text-[var(--color-text-faint)]">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="text-sm text-[var(--color-text)] focus:outline-none bg-transparent" />
          <label className="text-xs text-[var(--color-text-faint)] ml-2">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="text-sm text-[var(--color-text)] focus:outline-none bg-transparent" />
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none appearance-none pr-8"
        >
          <option value="all">All payment statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Unpaid</option>
          <option value="processing">Processing</option>
        </select>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search job, invoice, shipper…"
            className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-9 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none"
          />
        </div>

        <p className="ml-auto text-xs text-[var(--color-text-faint)]">
          {summary.job_count} jobs in range
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={DollarSign} label="Total Revenue" color="bg-emerald-50 text-emerald-600"
          value={fmtUSD(summary.total_revenue)}
          sub="Shipper invoices collected"
        />
        <SummaryCard
          icon={TrendingUp} label="Platform Fees" color="bg-[var(--color-teal-pale)] text-[var(--color-teal)]"
          value={fmtUSD(summary.platform_fees)}
          sub="Net margin on jobs"
        />
        <SummaryCard
          icon={ArrowDownCircle} label="Carrier Payouts" color="bg-blue-50 text-blue-600"
          value={fmtUSD(summary.carrier_payouts)}
          sub="After platform fee"
        />
        <SummaryCard
          icon={Clock} label="Pending / Outstanding" color="bg-amber-50 text-amber-600"
          value={fmtUSD(summary.pending)}
          sub="Awaiting payment"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-[var(--color-cream-dark)]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="h-3 w-24 rounded bg-[var(--color-cream-dark)]" />
                <div className="h-3 w-32 rounded bg-[var(--color-cream)]" />
                <div className="h-3 w-20 rounded bg-[var(--color-cream-dark)] ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={30} className="text-[var(--color-cream-dark)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-muted)]">No financial records for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  {['Invoice', 'Job', 'Shipper', 'Carrier', 'Shipper Total', 'Platform Fee', 'Carrier Payout', 'Payment', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="border-b border-[var(--color-cream-dark)] last:border-0 hover:bg-[var(--color-cream)] transition-colors">
                    <td className="px-4 py-3.5">
                      {row.invoice_number
                        ? <span className="font-mono text-xs text-[var(--color-teal)]">{row.invoice_number}</span>
                        : <span className="text-[var(--color-text-faint)]">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[var(--color-text)] truncate max-w-[160px]">{row.title ?? `Job #${row.id}`}</p>
                      {row.reference && (
                        <p className="text-xs text-[var(--color-text-faint)]">{row.reference}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-faint)]">{row.shipper ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[var(--color-text-faint)]">{row.carrier ?? '—'}</td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--color-text)]">{fmtUSD(row.shipper_total)}</td>
                    <td className="px-4 py-3.5 text-emerald-600 font-semibold">{fmtUSD(row.platform_fee)}</td>
                    <td className="px-4 py-3.5 text-blue-600">{fmtUSD(row.carrier_payout)}</td>
                    <td className="px-4 py-3.5">{statusBadge(row.payment_status)}</td>
                    <td className="px-4 py-3.5 text-xs text-[var(--color-text-faint)]">
                      {fmtDate(row.invoice_date ?? row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-faint)]">
                    Totals ({filtered.length} jobs)
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--color-text)]">
                    {fmtUSD(filtered.reduce((s, r) => s + (r.shipper_total ?? 0), 0))}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    {fmtUSD(filtered.reduce((s, r) => s + (r.platform_fee ?? 0), 0))}
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    {fmtUSD(filtered.reduce((s, r) => s + (r.carrier_payout ?? 0), 0))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
