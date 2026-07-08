'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, CheckCircle2, Loader2 } from 'lucide-react';
import { ratingApi } from '@/lib/api';
import { toast } from 'sonner';
import StarRating from '@/components/shared/StarRating';

interface RatingFormProps {
  jobId?: number;
  jobTitle?: string;
  /** The role of the current user */
  userRole?: 'shipper' | 'carrier';
  currentUserId: number;
  // Accept full job object (used by JobView)
  job?: { id: number; title?: string };
  role?: 'shipper' | 'carrier';
}

interface RatingData {
  overall: number;
  communication: number;
  reliability: number;
  comment: string;
}

const INITIAL: RatingData = { overall: 0, communication: 0, reliability: 0, comment: '' };

export function RatingForm(props: RatingFormProps) { return <RatingFormInner {...props} />; }
export default function RatingFormInner({ jobId: jobIdProp, jobTitle: jobTitleProp, userRole, currentUserId, job, role }: RatingFormProps) {
  const jobId    = job?.id    ?? jobIdProp!;
  const jobTitle = job?.title ?? jobTitleProp;
  userRole       = userRole ?? role;

  const qc = useQueryClient();

  // Check if the user already rated this job
  const { data: existing, isLoading: checkLoading } = useQuery({
    queryKey: ['job-ratings', jobId],
    queryFn: () => ratingApi.jobRatings(jobId).then(r => r.data.data as {rater_id?: number; overall: number; comment: string; created_at: string}[]),
    staleTime: 60_000,
  });

  const alreadyRated = existing?.some(r => r.rater_id === currentUserId) ?? false;
  const [form, setForm] = useState<RatingData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: () => ratingApi.create(jobId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-ratings', jobId] });
      setSubmitted(true);
      toast.success('Review submitted! Thank you.');
    },
    onError: (err: unknown) => {
      const msg = (err as {response?: {data?: {message?: string}}})?.response?.data?.message ?? 'Failed to submit review.';
      toast.error(msg);
    },
  });

  const reliabilityLabel = userRole === 'shipper' ? 'Punctuality' : 'Ease of access';

  if (checkLoading) return null;

  if (alreadyRated || submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-center gap-3">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Review submitted</p>
          <p className="text-xs text-emerald-700 mt-0.5">Your feedback helps build a trusted freight community.</p>
        </div>
      </div>
    );
  }

  const isValid = form.overall > 0 && form.communication > 0 && form.reliability > 0;

  return (
    <div className="rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Leave a review{jobTitle ? ` for "${jobTitle}"` : ''}
        </p>
      </div>

      <div className="space-y-3">
        {([
          ['overall',       'Overall experience'],
          ['communication', 'Communication'],
          ['reliability',   reliabilityLabel],
        ] as [keyof RatingData, string][]).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text)]">{label}</span>
            <StarRating
              value={form[key] as number}
              onChange={v => setForm(f => ({ ...f, [key]: v }))}
              size={18}
            />
          </div>
        ))}
      </div>

      <div>
        <textarea
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={3}
          maxLength={1000}
          placeholder="Optional: share your experience…"
          className="w-full rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] resize-none"
        />
        <p className="text-[11px] text-[var(--color-text-faint)] text-right mt-0.5">{form.comment.length}/1000</p>
      </div>

      <button
        onClick={() => submitMutation.mutate()}
        disabled={!isValid || submitMutation.isPending}
        className="flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--color-teal)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitMutation.isPending && <Loader2 size={13} className="animate-spin" />}
        {submitMutation.isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
