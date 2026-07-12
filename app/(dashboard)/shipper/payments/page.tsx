'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '@/lib/api';
import {
  TrendingUp, Clock,
  Search, X, Download, CreditCard, Hash,
  ChevronRight, Truck, MapPin, Package,
  CheckCircle2, RefreshCw, XCircle, RotateCcw,
  CalendarDays, Wallet, ArrowUpRight, FileText,
  AlertCircle, DollarSign,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TxStatus = 'paid' | 'pending' | 'processing' | 'failed' | 'refunded';

interface Transaction {
  id: number;
  invoiceNo: string;
  shipment: string;
  trackingToken: string;
  carrier: string;
  carrierCompany: string;
  carrierAvatar: string;
  amount: number;
  date: string;
  dueDate: string;
  status: TxStatus;
  paymentMethod: string;
  pickup: string;
  delivery: string;
  category: string;
  notes?: string;
}

// ── API transform ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTransaction(t: any): Transaction {
  return {
    id:             t.id,
    invoiceNo:      t.invoice_no,
    shipment:       t.shipment,
    trackingToken:  t.tracking_token,
    carrier:        t.carrier,
    carrierCompany: t.carrier_company,
    carrierAvatar:  t.carrier_avatar,
    amount:         t.amount,
    date:           t.date,
    dueDate:        t.due_date,
    status:         t.status as TxStatus,
    paymentMethod:  t.payment_method,
    pickup:         t.pickup,
    delivery:       t.delivery,
    category:       t.category,
    notes:          t.notes ?? undefined,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function StatusChip({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, { cls: string; icon: React.ElementType; label: string }> = {
    paid:       { cls: 'bg-emerald-50 text-emerald-700',                          icon: CheckCircle2, label: 'Paid'       },
    pending:    { cls: 'bg-amber-50 text-amber-700',                              icon: Clock,        label: 'Pending'    },
    processing: { cls: 'bg-blue-50 text-blue-600',                                icon: RefreshCw,    label: 'Processing' },
    failed:     { cls: 'bg-red-50 text-red-600',                                  icon: XCircle,      label: 'Failed'     },
    refunded:   { cls: 'bg-[var(--color-cream)] text-[var(--color-text-muted)]',  icon: RotateCcw,    label: 'Refunded'   },
  };
  const { cls, icon: Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={10} /> {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2 border-b border-[var(--color-cream-dark)] last:border-0 last:pb-0 first:pt-0">
      <span className="text-sm text-[var(--color-text-faint)] shrink-0 w-28">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)] text-right">{value}</span>
    </div>
  );
}

// ── Transaction Detail Panel ──────────────────────────────────────────────────

function TxPanel({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const steps: { label: string; done: boolean; date?: string }[] = [
    { label: 'Invoice created',
      done: true,
      date: fmtDate(tx.date) },
    { label: 'Payment initiated',
      done: tx.status !== 'pending',
      date: tx.status !== 'pending' ? fmtDate(tx.date) : undefined },
    { label: tx.status === 'failed'   ? 'Payment failed'
           : tx.status === 'refunded' ? 'Refunded'
           :                            'Payment confirmed',
      done: tx.status === 'paid' || tx.status === 'failed' || tx.status === 'refunded',
      date: tx.status === 'paid' ? fmtDate(tx.date) : undefined },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-1/2 min-w-[520px] bg-[var(--color-cream)] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-cream-dark)] bg-[var(--color-white)] px-6 py-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{tx.invoiceNo}</h2>
              <StatusChip status={tx.status} />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-faint)]">
              <Hash size={12} />
              <span className="font-mono">{tx.trackingToken}</span>
              <span className="opacity-40">·</span>
              <span>{tx.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Amount card */}
          <div className={`rounded-xl p-5 text-center border ${
            tx.status === 'paid'       ? 'bg-emerald-50 border-emerald-200'                          :
            tx.status === 'failed'     ? 'bg-red-50 border-red-200'                                  :
            tx.status === 'refunded'   ? 'bg-[var(--color-cream)] border-[var(--color-cream-dark)]'  :
                                         'bg-[var(--color-teal-pale)] border-[var(--color-teal)]'
          }`}>
            <p className={`text-4xl font-bold ${
              tx.status === 'paid'       ? 'text-emerald-700'                  :
              tx.status === 'failed'     ? 'text-red-600'                      :
              tx.status === 'refunded'   ? 'text-[var(--color-text-muted)]'    :
                                           'text-[var(--color-slate)]'
            }`}>{fmt(tx.amount)}</p>
            <p className="mt-1.5 text-sm text-[var(--color-text-faint)]">
              {tx.status === 'paid'       ? `Paid on ${fmtDate(tx.date)}`   :
               tx.status === 'pending'    ? `Due ${fmtDate(tx.dueDate)}`    :
               tx.status === 'processing' ? 'Processing payment…'           :
               tx.status === 'failed'     ? 'Payment failed'                :
               `Refunded on ${fmtDate(tx.date)}`}
            </p>
          </div>

          {/* Pay now */}
          {(tx.status === 'pending' || tx.status === 'failed') && (
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-teal)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] transition-colors shadow-sm">
              <CreditCard size={15} /> Pay {fmt(tx.amount)} now
            </button>
          )}

          {/* Payment */}
          <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Wallet size={12} className="text-[var(--color-teal)]" /> Payment
            </p>
            <Row label="Method"   value={tx.paymentMethod} />
            <Row label="Invoice"  value={tx.invoiceNo} />
            <Row label="Date"     value={fmtDate(tx.date)} />
            <Row label="Due date" value={fmtDate(tx.dueDate)} />
          </div>

          {/* Shipment */}
          <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Package size={12} className="text-[var(--color-teal)]" /> Shipment
            </p>
            <Row label="Description" value={tx.shipment} />
            <Row label="Category"    value={tx.category} />
            <Row label="Pickup"      value={tx.pickup} />
            <Row label="Delivery"    value={tx.delivery} />
          </div>

          {/* Carrier */}
          <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Truck size={12} className="text-[var(--color-teal)]" /> Carrier
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-slate)] text-xs font-bold text-white">
                {tx.carrierAvatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{tx.carrier}</p>
                <p className="text-xs text-[var(--color-text-faint)]">{tx.carrierCompany}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {tx.notes && (
            <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Notes</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{tx.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Timeline</p>
            <div>
              {steps.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                      step.done
                        ? (tx.status === 'failed' && i === 2 ? 'bg-red-100' : 'bg-emerald-100')
                        : 'bg-[var(--color-cream-dark)]'
                    }`}>
                      {step.done
                        ? (tx.status === 'failed' && i === 2
                            ? <XCircle size={11} className="text-red-500" />
                            : <CheckCircle2 size={11} className="text-emerald-600" />)
                        : <div className="h-2 w-2 rounded-full bg-[var(--color-text-faint)]" />
                      }
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-px my-1 ${step.done ? 'bg-emerald-200' : 'bg-[var(--color-cream-dark)]'}`}
                        style={{ minHeight: '20px' }}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-medium ${step.done ? 'text-[var(--color-text)]' : 'text-[var(--color-text-faint)]'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{step.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
            <Download size={14} /> Download invoice PDF
          </button>

        </div>
      </div>
    </>
  );
}

// ── Filter config ─────────────────────────────────────────────────────────────

const FILTERS: { value: TxStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'All'        },
  { value: 'paid',       label: 'Paid'       },
  { value: 'pending',    label: 'Pending'    },
  { value: 'processing', label: 'Processing' },
  { value: 'failed',     label: 'Failed'     },
  { value: 'refunded',   label: 'Refunded'   },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShipperPaymentsPage() {
  const [filter, setFilter]     = useState<TxStatus | 'all'>('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => transactionApi.list().then((r) => (r.data.data as any[]).map(toTransaction)),
  });

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      const matchStatus = filter === 'all' || t.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || [t.invoiceNo, t.shipment, t.carrier, t.carrierCompany, t.category, t.pickup, t.delivery]
        .some((f) => f.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    }),
    [transactions, filter, search]
  );

  const stats = useMemo(() => {
    const paidTxs     = transactions.filter((t) => t.status === 'paid');
    const paid        = paidTxs.reduce((s, t) => s + t.amount, 0);
    const outstanding = transactions.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    const thisMonth   = transactions.filter((t) => t.date.startsWith('2026-06')).reduce((s, t) => s + t.amount, 0);
    const avg         = paidTxs.length ? paid / paidTxs.length : 0;
    return { paid, outstanding, thisMonth, avg };
  }, [transactions]);

  const failedCount  = transactions.filter((t) => t.status === 'failed').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  return (
    <>
      {selected && <TxPanel tx={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6">

        {isLoading && (
          <div className="space-y-4">
            <div className="h-8 w-48 rounded-xl bg-[var(--color-cream-dark)] animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[var(--color-cream-dark)] animate-pulse" />)}
            </div>
            <div className="h-64 rounded-2xl bg-[var(--color-cream-dark)] animate-pulse" />
          </div>
        )}

        {!isLoading && <>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">
              Payments
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-faint)]">
              Invoices, transactions and billing history
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total paid',       value: fmt(stats.paid),        icon: CheckCircle2, color: 'text-emerald-600',         bg: 'bg-emerald-50'               },
            { label: 'Outstanding',      value: fmt(stats.outstanding), icon: Clock,        color: 'text-amber-600',           bg: 'bg-amber-50'                 },
            { label: 'This month',       value: fmt(stats.thisMonth),   icon: CalendarDays, color: 'text-[var(--color-teal)]', bg: 'bg-[var(--color-teal-pale)]' },
            { label: 'Avg per shipment', value: fmt(stats.avg),         icon: TrendingUp,   color: 'text-blue-600',            bg: 'bg-blue-50'                  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-[var(--color-slate)] truncate">{value}</p>
                <p className="text-xs text-[var(--color-text-faint)]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action required banner */}
        {(failedCount > 0 || pendingCount > 0) && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Action required</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {failedCount > 0 && (
                    <span className="font-semibold">{failedCount} failed payment{failedCount > 1 ? 's' : ''}</span>
                  )}
                  {failedCount > 0 && pendingCount > 0 && ' and '}
                  {pendingCount > 0 && (
                    <span className="font-semibold">{pendingCount} pending invoice{pendingCount > 1 ? 's' : ''}</span>
                  )}
                  {' '}requiring your attention.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilter('pending')}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Review <ArrowUpRight size={13} />
            </button>
          </div>
        )}

        {/* Filter + search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice, shipment, carrier or category…"
              className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] pl-10 pr-4 py-2.5 text-sm focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20"
            />
          </div>
          <div className="flex rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-1 gap-0.5">
            {FILTERS.map(({ value, label }) => (
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

        {/* Transactions table */}
        <div className="rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign size={32} className="text-[var(--color-cream-dark)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">No transactions found</p>
              <p className="text-xs text-[var(--color-text-faint)] mt-1">Try a different filter or search term</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Shipment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Carrier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelected(tx)}
                    className="border-b border-[var(--color-cream-dark)] last:border-0 hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                  >
                    {/* Invoice */}
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-[var(--color-text)]">{tx.invoiceNo}</p>
                      <p className="font-mono text-xs text-[var(--color-text-faint)] mt-0.5">{tx.trackingToken}</p>
                    </td>
                    {/* Shipment */}
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="font-semibold text-[var(--color-text)] truncate">{tx.shipment}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--color-text-faint)]">
                        <MapPin size={10} />
                        <span className="truncate">{tx.pickup} → {tx.delivery}</span>
                      </div>
                    </td>
                    {/* Carrier */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-slate)] text-xs font-bold text-white">
                          {tx.carrierAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{tx.carrier}</p>
                          <p className="text-xs text-[var(--color-text-faint)]">{tx.carrierCompany}</p>
                        </div>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-[var(--color-text)]">{fmtDate(tx.date)}</p>
                      <p className="text-xs text-[var(--color-text-faint)]">Due {fmtDate(tx.dueDate)}</p>
                    </td>
                    {/* Amount */}
                    <td className="px-4 py-4 text-right">
                      <p className={`text-sm font-bold ${
                        tx.status === 'failed'   ? 'text-red-500'                                   :
                        tx.status === 'refunded' ? 'text-[var(--color-text-muted)] line-through'    :
                                                   'text-[var(--color-slate)]'
                      }`}>{fmt(tx.amount)}</p>
                      <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{tx.paymentMethod.split(' ')[0]}</p>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusChip status={tx.status} />
                    </td>
                    {/* Action */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(tx)}
                        className="rounded-lg border border-[var(--color-cream-dark)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors flex items-center gap-1"
                      >
                        View <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        </>}

      </div>
    </>
  );
}
