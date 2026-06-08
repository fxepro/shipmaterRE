'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { bidApi } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

// ── Inner form (needs useStripe / useElements inside <Elements>) ──────────────

interface PaymentFormProps {
  amount: number;
  feeCents: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function PaymentForm({ amount, feeCents, onSuccess, onCancel }: PaymentFormProps) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const platformFee = feeCents / 100;
  const carrierGets = amount - platformFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Payment failed.');
      setLoading(false);
      return;
    }

    // confirmPayment with redirect: 'if_required' keeps everything in-page.
    // Since capture_method is 'manual', this only authorizes the card.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment authorization failed.');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'requires_capture' || paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setError('Unexpected payment state. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Payment breakdown */}
      <div className="rounded-xl bg-[var(--color-cream)] p-4 space-y-2 text-sm">
        <div className="flex justify-between text-[var(--color-text-muted)]">
          <span>Freight total</span>
          <span className="font-semibold text-[var(--color-text)]">
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-[var(--color-text-faint)] text-xs">
          <span>Platform fee (held, released on delivery)</span>
          <span>−${platformFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-[var(--color-cream-dark)] pt-2 flex justify-between font-semibold text-[var(--color-text)]">
          <span>Carrier receives</span>
          <span className="text-[var(--color-teal)]">
            ${carrierGets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { address: { country: 'never' } } },
        }}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-faint)]">
        <Lock size={11} />
        Your payment is authorized now and only captured when the carrier delivers.
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-[var(--color-cream-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-teal)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Authorizing…</>
          ) : (
            <><CreditCard size={14} /> Authorize ${amount.toFixed(2)}</>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

interface FreightPaymentModalProps {
  bidId: number;
  carrierName: string;
  route: string;
  itemDescription: string;
  onAccepted: () => void;
  onClose: () => void;
}

export function FreightPaymentModal({
  bidId,
  carrierName,
  route,
  itemDescription,
  onAccepted,
  onClose,
}: FreightPaymentModalProps) {
  const [step, setStep]             = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountCents, setAmountCents]   = useState(0);
  const [feeCents, setFeeCents]         = useState(0);
  const [pendingIntentId, setPendingIntentId] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading]     = useState(false);

  useEffect(() => {
    bidApi.paymentIntent(bidId)
      .then((res) => {
        setClientSecret(res.data.client_secret);
        setAmountCents(res.data.amount_cents);
        setFeeCents(res.data.fee_cents);
        setStep('form');
      })
      .catch(() => {
        toast.error('Could not load payment. Try again.');
        setStep('error');
      });
  }, [bidId]);

  async function handlePaymentAuthorized(paymentIntentId: string) {
    setPendingIntentId(paymentIntentId);
    setAcceptLoading(true);
    try {
      await bidApi.accept(bidId, paymentIntentId);
      setStep('success');
      toast.success('Bid accepted — carrier assigned!');
    } catch {
      toast.error('Payment authorized but bid acceptance failed. Contact support.');
    } finally {
      setAcceptLoading(false);
    }
  }

  function handleDone() {
    onAccepted();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--color-white)] shadow-2xl">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-cream-dark)] px-6 py-5">
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">Accept bid & authorize payment</h2>
              <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">
                {carrierName} · {itemDescription}
              </p>
              <p className="text-xs text-[var(--color-text-faint)]">{route}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-faint)] hover:bg-[var(--color-cream)] hover:text-[var(--color-text)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {step === 'loading' && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[var(--color-teal)]" />
              </div>
            )}

            {step === 'error' && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-sm text-[var(--color-text-muted)]">Failed to load payment. Please close and try again.</p>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-[var(--color-cream)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-cream-dark)] transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {step === 'form' && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { colorPrimary: '#2A8C8A', borderRadius: '10px' },
                  },
                }}
              >
                <PaymentForm
                  amount={amountCents / 100}
                  feeCents={feeCents}
                  onSuccess={handlePaymentAuthorized}
                  onCancel={onClose}
                />
              </Elements>
            )}

            {/* Step between authorized + accept call */}
            {pendingIntentId && acceptLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-text-muted)]">
                <Loader2 size={16} className="animate-spin text-[var(--color-teal)]" />
                Finalizing assignment…
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Carrier assigned!</p>
                  <p className="mt-1 text-sm text-[var(--color-text-faint)]">
                    Payment of ${(amountCents / 100).toFixed(2)} is authorized and will be captured when delivery is confirmed.
                  </p>
                </div>
                <button
                  onClick={handleDone}
                  className="w-full rounded-xl bg-[var(--color-teal)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-light)] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
