'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function FinancialTab() {
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const stripeStatus = profile?.stripe_account_status || 'not_connected';
  const stripeAccountId = profile?.stripe_account_id;

  async function handleStripeConnect() {
    try {
      setIsConnecting(true);
      const res = await api.post('/api/v1/stripe/connect/create-account-link', {
        stripe_account_id: stripeAccountId,
      });

      // Open Stripe Express onboarding in new window
      window.open(res.data.url, '_blank', 'width=800,height=600');

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const check = await api.get('/api/v1/carrier/profile');
        if (check.data?.data?.stripe_account_status === 'verified') {
          clearInterval(pollInterval);
          refetch();
          toast.success('Stripe account connected!');
          setIsConnecting(false);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setIsConnecting(false);
        refetch(); // Check status one more time
      }, 600000); // 10 minute timeout
    } catch (err) {
      toast.error('Failed to connect Stripe account');
      setIsConnecting(false);
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stripe Connect Section */}
      <div className="rounded-lg bg-[var(--color-teal-pale)] border border-[var(--color-teal)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[var(--color-teal)] mb-1">Stripe Connect</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Connect your bank account to receive payments from completed shipments. Funds are deposited within 1-2 business days.
            </p>

            {stripeStatus === 'not_connected' && (
              <button
                onClick={handleStripeConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} />
                    Connect Bank Account
                  </>
                )}
              </button>
            )}

            {stripeStatus === 'pending' && (
              <div className="flex items-center gap-2 text-[var(--color-teal)]">
                <Loader size={14} className="animate-spin" />
                <span className="text-sm font-medium">Verification in progress…</span>
              </div>
            )}

            {stripeStatus === 'verified' && (
              <div className="flex items-center gap-2 text-[var(--color-success)]">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Connected & verified</span>
              </div>
            )}

            {stripeStatus === 'restricted' && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-orange-900">Account restricted</p>
                  <p className="text-xs text-orange-800">Please verify your identity in Stripe.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Information */}
      {stripeStatus === 'verified' && (
        <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-4">Payout Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-cream-dark)]">
              <span className="text-sm text-[var(--color-text-muted)]">Stripe Instant Transfer</span>
              <span className="text-xs font-medium text-[var(--color-text-faint)]">Next business day</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--color-cream-dark)]">
              <span className="text-sm text-[var(--color-text-muted)]">ACH Bank Transfer</span>
              <span className="text-xs font-medium text-[var(--color-text-faint)]">2-3 business days</span>
            </div>
          </div>
        </div>
      )}

      {/* W-9 / Tax Info */}
      <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Tax Reporting (1099-NEC)</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          If you earn over $600 in a calendar year, Shipmater will issue a 1099-NEC form for tax filing. Full SSN collection is handled securely through Stripe during account verification.
        </p>

        {stripeStatus === 'verified' && (
          <div className="flex items-center gap-2 text-[var(--color-success)]">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Tax information collected</span>
          </div>
        )}

        {stripeStatus !== 'verified' && (
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <AlertCircle size={16} />
            <span className="text-sm">Complete Stripe verification to collect tax information</span>
          </div>
        )}
      </div>

      {/* Legal */}
      <div className="text-xs text-[var(--color-text-faint)] space-y-1">
        <p>💡 By using Shipmater, you agree to our payment processing terms through Stripe Connect.</p>
        <p>Platform fees are deducted automatically before your payout.</p>
      </div>
    </div>
  );
}
