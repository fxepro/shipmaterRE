'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Request a new email from your profile.');
      return;
    }

    let cancelled = false;
    authApi.verifyEmail(token)
      .then((res) => {
        if (cancelled) return;
        setStatus('ok');
        setMessage(res.data?.message ?? 'Email verified successfully.');
        setTimeout(() => router.replace('/shipper/profile'), 2500);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setStatus('error');
        setMessage(msg ?? 'Invalid or expired verification link.');
      });

    return () => { cancelled = true; };
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg, #f7f5f0)' }}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-cream-dark,#e8e2d6)] bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[var(--color-teal,#0d9488)]" />
        )}
        {status === 'ok' && (
          <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-600" />
        )}
        {status === 'error' && (
          <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        )}
        <h1 className="text-xl font-semibold text-[var(--color-text,#1a1a1a)]">Email verification</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted,#666)]">{message}</p>
        {status === 'error' && (
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-[var(--color-teal,#0d9488)] hover:underline"
          >
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-teal,#0d9488)]" />
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  );
}
