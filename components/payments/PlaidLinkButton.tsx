'use client';

import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Building2, CheckCircle2, Loader2, Unlink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { plaidApi } from '@/lib/api';

interface BankStatus {
  connected: boolean;
  bank_name?: string;
  bank_last4?: string;
  institution_name?: string;
  connected_at?: string;
}

interface PlaidLinkButtonProps {
  onConnected?: (status: BankStatus) => void;
}

export function PlaidLinkButton({ onConnected }: PlaidLinkButtonProps) {
  const [linkToken,   setLinkToken]   = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [connecting,  setConnecting]  = useState(false);
  const [status,      setStatus]      = useState<BankStatus | null>(null);
  const [pending,     setPending]     = useState(false);  // Plaid not configured

  const fetchLinkToken = useCallback(async () => {
    setLoadingToken(true);
    try {
      const res = await plaidApi.linkToken();
      if (res.data.pending) {
        setPending(true);
        toast.info('Bank connection will be available shortly.');
        return;
      }
      setLinkToken(res.data.link_token);
    } catch {
      toast.error('Could not start bank connection. Try again.');
    } finally {
      setLoadingToken(false);
    }
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: async (publicToken, metadata) => {
      const account = metadata.accounts?.[0];
      if (!account) {
        toast.error('No account selected.');
        return;
      }
      setConnecting(true);
      try {
        const res = await plaidApi.exchange({
          public_token:     publicToken,
          account_id:       account.id,
          institution_name: metadata.institution?.name,
        });
        const newStatus: BankStatus = {
          connected:        true,
          bank_name:        res.data.bank_name,
          bank_last4:       res.data.bank_last4,
          institution_name: res.data.institution_name,
        };
        setStatus(newStatus);
        setLinkToken(null);
        toast.success('Bank account connected!');
        onConnected?.(newStatus);
      } catch {
        toast.error('Failed to connect bank account. Try again.');
      } finally {
        setConnecting(false);
      }
    },
    onExit: () => {
      setLinkToken(null);
    },
  });

  // Open Plaid Link once token is ready
  const handleConnect = async () => {
    if (!linkToken) {
      await fetchLinkToken();
    } else if (ready) {
      open();
    }
  };

  // Auto-open once token arrives
  const wasReady = linkToken && ready;
  if (wasReady) {
    open();
  }

  async function handleDisconnect() {
    try {
      await plaidApi.disconnect();
      setStatus(null);
      toast.success('Bank account disconnected.');
      onConnected?.({ connected: false });
    } catch {
      toast.error('Failed to disconnect bank account.');
    }
  }

  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Loader2 size={14} className="animate-spin text-[var(--color-teal)]" />
        Connecting bank account…
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {status.institution_name ?? 'Bank'} ••••{status.bank_last4}
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">{status.bank_name} · ACH enabled</p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <Unlink size={11} /> Disconnect
        </button>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <AlertCircle size={15} className="shrink-0" />
        Plaid not configured yet — ACH will be available once credentials are added.
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loadingToken || (!!linkToken && !ready)}
      className="flex items-center gap-2 rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors disabled:opacity-60"
    >
      {loadingToken ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Building2 size={14} />
      )}
      Connect bank account (ACH)
    </button>
  );
}
