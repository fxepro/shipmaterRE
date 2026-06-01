'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, getRolePath } from '@/lib/auth';
import { setDemoUser } from '@/lib/demo';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const user = await login(data.email, data.password);
      router.replace(getRolePath(user.role));
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Shipmater
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Sign in to your account</p>
        </div>

        <div className="bg-[var(--color-white)] rounded-2xl border border-[var(--color-cream-dark)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                placeholder="you@company.com"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>}
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-[var(--color-slate)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[var(--color-teal)] hover:underline">
            Create one
          </Link>
        </p>

        {/* Demo mode */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-[var(--color-cream-dark)]" />
            <span className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)]">
              or browse demo
            </span>
            <div className="h-px flex-1 bg-[var(--color-cream-dark)]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['shipper', 'carrier', 'receiver', 'admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  const user = setDemoUser(role);
                  router.replace(getRolePath(user.role));
                }}
                className="rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-white)] py-2 text-xs font-medium capitalize text-[var(--color-text-muted)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
