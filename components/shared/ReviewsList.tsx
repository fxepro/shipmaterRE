'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { ratingApi } from '@/lib/api';
import StarRating from '@/components/shared/StarRating';

interface Review {
  id: number;
  rater_type: 'shipper' | 'carrier';
  rater_org: string | null;
  job_title: string | null;
  overall: number;
  communication: number;
  reliability: number;
  average: number;
  comment: string | null;
  created_at: string;
}

interface ReviewsListProps {
  orgId: number;
  /** Show only reviews left BY this type (e.g. show carrier's reviews left by shippers) */
  filter?: 'shipper' | 'carrier';
  /** Avg rating to display at top */
  avgRating?: number | null;
  totalRatings?: number;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ReviewsList({ orgId, filter, avgRating, totalRatings }: ReviewsListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['org-ratings', orgId, page],
    queryFn: () => ratingApi.orgRatings(orgId, page).then(r => r.data),
    staleTime: 60_000,
  });

  const reviews: Review[] = (data?.data ?? []).filter((r: Review) => !filter || r.rater_type === filter);
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--color-cream-dark)] p-4 space-y-2">
            <div className="h-3 w-32 bg-[var(--color-cream-dark)] rounded" />
            <div className="h-3 w-48 bg-[var(--color-cream)] rounded" />
            <div className="h-3 w-full bg-[var(--color-cream)] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Summary bar */}
      {(avgRating != null || totalRatings != null) && (
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-5 py-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-text)]">{avgRating?.toFixed(1) ?? '—'}</p>
            <StarRating value={avgRating ?? 0} readonly size={14} />
          </div>
          <div className="border-l border-[var(--color-cream-dark)] pl-4">
            <p className="text-sm text-[var(--color-text)]">
              <span className="font-semibold">{totalRatings ?? 0}</span> review{totalRatings !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
              From verified {filter === 'shipper' ? 'shippers' : filter === 'carrier' ? 'carriers' : 'platform users'}
            </p>
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <MessageSquare size={28} className="text-[var(--color-cream-dark)] mb-2" />
          <p className="text-sm text-[var(--color-text-faint)]">No reviews yet</p>
        </div>
      ) : (
        reviews.map(r => (
          <div key={r.id} className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{r.rater_org ?? 'Anonymous'}</p>
                {r.job_title && (
                  <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{r.job_title}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StarRating value={r.average} readonly size={13} />
                <span className="text-xs text-[var(--color-text-faint)]">{fmtDate(r.created_at)}</span>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-3 gap-2 my-2.5">
              {[
                ['Overall',       r.overall],
                ['Communication', r.communication],
                ['Reliability',   r.reliability],
              ].map(([label, val]) => (
                <div key={label as string} className="text-center">
                  <p className="text-[10px] text-[var(--color-text-faint)] mb-0.5">{label}</p>
                  <StarRating value={val as number} readonly size={11} />
                </div>
              ))}
            </div>

            {r.comment && (
              <p className="text-sm text-[var(--color-text)] mt-2 italic border-t border-[var(--color-cream-dark)] pt-2">
                "{r.comment}"
              </p>
            )}
          </div>
        ))
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-cream-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-faint)] hover:border-[var(--color-teal)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={12} /> Previous
          </button>
          <span className="text-xs text-[var(--color-text-faint)]">
            Page {meta.current_page} of {meta.last_page} · {meta.total} total
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-cream-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-faint)] hover:border-[var(--color-teal)] disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
