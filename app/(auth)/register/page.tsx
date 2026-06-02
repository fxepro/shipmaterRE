'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, setStoredToken } from '@/lib/api';
import { getRolePath } from '@/lib/auth';
type RegisterRole = 'shipper' | 'carrier' | 'receiver';

const schema = z.object({
  name:                  z.string().min(2, 'Name is required'),
  email:                 z.string().email('Enter a valid email'),
  password:              z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string(),
  role:                  z.enum(['shipper', 'carrier', 'receiver']),
  company_name:          z.string().optional(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

const ROLES: { value: RegisterRole; label: string; description: string }[] = [
  { value: 'shipper',  label: 'Shipper',  description: 'Post freight jobs and manage shipments' },
  { value: 'carrier',  label: 'Carrier',  description: 'Bid on jobs and transport freight' },
  { value: 'receiver', label: 'Receiver', description: 'Track incoming deliveries' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'shipper' },
  });

  const selectedRole = watch('role');

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await authApi.register(data);
      const { token } = res.data as { token: string };
      setStoredToken(token);
      router.replace(getRolePath(data.role));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
            Create an account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Join Shipmater today</p>
        </div>

        <div className="bg-[var(--color-white)] rounded-2xl border border-[var(--color-cream-dark)] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role selection */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue('role', role.value)}
                    className={`rounded-lg border p-3 text-left text-xs transition-all ${
                      selectedRole === role.value
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)] text-[var(--color-teal)]'
                        : 'border-[var(--color-cream-dark)] bg-[var(--color-cream)] text-[var(--color-text-muted)] hover:border-[var(--color-teal-light)]'
                    }`}
                  >
                    <p className="font-medium">{role.label}</p>
                    <p className="mt-0.5 text-xs opacity-70">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Full Name</label>
                <input
                  className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                  placeholder="Jane Smith"
                  {...register('name')}
                />
                {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Company (optional)</label>
                <input
                  className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                  placeholder="Acme Logistics"
                  {...register('company_name')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Email</label>
              <input
                type="email"
                className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                placeholder="you@company.com"
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Password</label>
                <input
                  type="password"
                  className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.07em] text-[var(--color-text-faint)] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  className="w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                  placeholder="••••••••"
                  {...register('password_confirmation')}
                />
                {errors.password_confirmation && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[var(--color-slate)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-slate-80)] disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--color-teal)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
