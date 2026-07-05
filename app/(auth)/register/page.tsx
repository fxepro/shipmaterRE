'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Truck } from 'lucide-react';
import { authApi, setStoredToken } from '@/lib/api';
import { getRolePath } from '@/lib/auth';
import { getTenantConfigClient, type TenantConfig } from '@/lib/tenant';

const B = {
  teal:     '#90E0EF',
  tealDark: '#0096C7',
  tealBg:   '#E0F7FA',
  darkSec:  '#0A2E40',
  darkCard: '#0A1520',
  gray100:  '#161616',
  gray70:   '#525252',
  gray50:   '#8D8D8D',
  gray10:   '#F4F4F4',
  white:    '#FFFFFF',
  red:      '#C0392B',
  redBg:    '#FEF2F2',
};
const IBM = "'IBM Plex Sans', system-ui, sans-serif";

const schema = z.object({
  name:                  z.string().min(2, 'Name is required'),
  email:                 z.string().email('Enter a valid email'),
  password:              z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string(),
  role:                  z.enum(['shipper', 'carrier']),
  company_name:          z.string().optional(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  {
    value:       'shipper' as const,
    label:       'Shipper',
    icon:        Package,
    description: 'Post jobs, hire verified providers, track every delivery live.',
  },
  {
    value:       'carrier' as const,
    label:       'Carrier',
    icon:        Truck,
    description: 'Browse matching loads, bid or get hired direct, get paid fast.',
  },
];

const inputStyle = {
  width: '100%',
  fontFamily: IBM,
  fontSize: 15,
  color: B.gray100,
  background: B.gray10,
  border: '1px solid transparent',
  borderRadius: 6,
  padding: '10px 14px',
  boxSizing: 'border-box' as const,
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError]   = useState('');
  const [tenant, setTenant] = useState<TenantConfig | null>(null);

  useEffect(() => { setTenant(getTenantConfigClient()); }, []);

  const accentColor = tenant?.primary_color   ?? B.tealDark;
  const navyColor   = tenant?.secondary_color ?? B.darkSec;
  const brandName   = tenant?.brand_name      ?? 'Shipmater';

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
    <div style={{
      fontFamily: IBM,
      WebkitFontSmoothing: 'antialiased',
      minHeight: '100vh',
      background: `linear-gradient(145deg, ${B.darkCard} 0%, ${navyColor} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>

      {/* Wordmark / Logo */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: 36 }}>
        {tenant?.logo_url_dark ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logo_url_dark} alt={brandName} style={{ maxHeight: 40, maxWidth: 200, objectFit: 'contain' }} />
        ) : (
          <span style={{ fontFamily: IBM, fontWeight: 700, fontSize: 26, color: B.white, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
            {brandName}
          </span>
        )}
      </Link>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: B.white,
        borderRadius: 10,
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
      }}>
        <h1 style={{ fontFamily: IBM, fontWeight: 700, fontSize: 22, color: B.gray100, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Create an account
        </h1>
        <p style={{ fontFamily: IBM, fontSize: 15, color: B.gray50, marginBottom: 28 }}>
          Join {brandName} — free to get started
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 10 }}>
              I am a…
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ROLES.map(({ value, label, icon: Icon, description }) => {
                const active = selectedRole === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '14px 16px',
                      borderRadius: 8,
                      border: `2px solid ${active ? accentColor : B.gray10}`,
                      background: active ? B.tealBg : B.gray10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    {/* Radio dot + icon row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${active ? accentColor : B.gray50}`,
                        background: active ? accentColor : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: B.white }} />}
                      </div>
                      <Icon size={16} color={active ? accentColor : B.gray50} />
                    </div>
                    <div>
                      <p style={{ fontFamily: IBM, fontWeight: 600, fontSize: 14, color: active ? accentColor : B.gray100, marginBottom: 2 }}>
                        {label}
                      </p>
                      <p style={{ fontFamily: IBM, fontSize: 12, color: active ? accentColor : B.gray50, lineHeight: 1.5, opacity: active ? 0.85 : 1 }}>
                        {description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name + Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 6 }}>
                Full name
              </label>
              <input
                style={inputStyle}
                className="outline-none focus:border-[#0096C7]"
                placeholder="Jane Smith"
                {...register('name')}
              />
              {errors.name && <p style={{ fontFamily: IBM, fontSize: 12, color: B.red, marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 6 }}>
                Company <span style={{ color: B.gray50, fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                style={inputStyle}
                className="outline-none focus:border-[#0096C7]"
                placeholder="Acme Logistics"
                {...register('company_name')}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              style={inputStyle}
              className="outline-none focus:border-[#0096C7]"
              placeholder="you@company.com"
              {...register('email')}
            />
            {errors.email && <p style={{ fontFamily: IBM, fontSize: 12, color: B.red, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                style={inputStyle}
                className="outline-none focus:border-[#0096C7]"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && <p style={{ fontFamily: IBM, fontSize: 12, color: B.red, marginTop: 4 }}>{errors.password.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: IBM, fontSize: 13, fontWeight: 500, color: B.gray70, marginBottom: 6 }}>
                Confirm
              </label>
              <input
                type="password"
                autoComplete="new-password"
                style={inputStyle}
                className="outline-none focus:border-[#0096C7]"
                placeholder="••••••••"
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && <p style={{ fontFamily: IBM, fontSize: 12, color: B.red, marginTop: 4 }}>{errors.password_confirmation.message}</p>}
            </div>
          </div>

          {/* API error */}
          {error && (
            <div style={{ background: B.redBg, border: '1px solid #FECACA', borderRadius: 6, padding: '10px 14px', marginBottom: 18 }}>
              <p style={{ fontFamily: IBM, fontSize: 13, color: B.red }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              fontFamily: IBM,
              fontSize: 15,
              fontWeight: 600,
              color: B.white,
              background: isSubmitting ? B.gray50 : accentColor,
              border: 'none',
              borderRadius: 6,
              padding: '12px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? 'Creating account…' : `Create ${selectedRole} account`}
          </button>
        </form>
      </div>

      {/* Sign in link */}
      <p style={{ fontFamily: IBM, fontSize: 14, color: 'rgba(255,255,255,0.50)', marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: B.teal, fontWeight: 500, textDecoration: 'none' }}
          className="hover:underline">
          Sign in
        </Link>
      </p>

      {/* "Powered by" — hidden if tenant opts out */}
      {tenant && !tenant.hide_powered_by && (
        <p style={{ fontFamily: IBM, fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
          Powered by Shipmater
        </p>
      )}

    </div>
  );
}
