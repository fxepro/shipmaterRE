'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle, Loader, Clock } from 'lucide-react';

export function BackgroundTab() {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm text-yellow-800">Unable to load background check status. Backend API not yet available.</p>
      </div>
    );
  }

  const bgStatus = profile?.background_check_status || 'not_started';

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; description: string; color: string }> = {
    not_started: {
      icon: <AlertCircle size={20} className="text-[var(--color-warning)]" />,
      label: 'Not Started',
      description: 'Background check has not been initiated yet.',
      color: 'bg-yellow-50 border-yellow-200',
    },
    pending: {
      icon: <Loader size={20} className="text-[var(--color-teal)] animate-spin" />,
      label: 'In Progress',
      description: 'Your background check is being processed. This typically takes 3-5 business days.',
      color: 'bg-blue-50 border-blue-200',
    },
    passed: {
      icon: <CheckCircle size={20} className="text-[var(--color-success)]" />,
      label: 'Passed',
      description: 'Your background check is clear. Shippers can see this on your profile.',
      color: 'bg-green-50 border-green-200',
    },
    failed: {
      icon: <AlertCircle size={20} className="text-[var(--color-danger)]" />,
      label: 'Failed',
      description: 'There was an issue with your background check. Please contact support.',
      color: 'bg-red-50 border-red-200',
    },
  };

  const config = statusConfig[bgStatus] || statusConfig.not_started;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`rounded-lg border p-6 ${config.color}`}>
        <div className="flex items-start gap-4">
          <div className="pt-1">{config.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--color-text)] mb-1">{config.label}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{config.description}</p>
          </div>
        </div>
      </div>

      {/* What We Check */}
      <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">What We Check</h3>
        <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-teal)] mt-1">✓</span>
            <span>Criminal background check (national, federal, and county level)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-teal)] mt-1">✓</span>
            <span>Motor Vehicle Record (MVR) - driving history and violations</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-teal)] mt-1">✓</span>
            <span>OFAC / Sanctions list screening</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-teal)] mt-1">✓</span>
            <span>Sex offender registry check</span>
          </li>
        </ul>
      </div>

      {/* Timeline */}
      <div className="bg-[var(--color-cream)] rounded-lg p-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Typical Timeline</h3>
        <div className="space-y-4">
          {[
            { day: 'Day 1', action: 'Submitted for review' },
            { day: '2-5 days', action: 'Background check processing' },
            { day: '5-7 days', action: 'Results delivered and reviewed' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-white)] border border-[var(--color-cream-dark)] flex items-center justify-center text-xs font-medium text-[var(--color-text-faint)]">
                {item.day}
              </div>
              <span className="text-sm text-[var(--color-text)]">{item.action}</span>
            </div>
          ))}
        </div>
      </div>

      {bgStatus === 'not_started' && (
        <div className="rounded-lg bg-[var(--color-teal-pale)] border border-[var(--color-teal)] p-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            A background check is required to access most jobs and build shipper trust. You'll need to complete your personal information first.
          </p>
          {profile?.date_of_birth && profile?.ssn_last_4 ? (
            <button className="rounded-lg bg-[var(--color-teal)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-teal-light)] transition-colors">
              Start Background Check
            </button>
          ) : (
            <p className="text-xs text-[var(--color-text-faint)] flex items-center gap-2">
              <Clock size={14} />
              Complete your personal information first
            </p>
          )}
        </div>
      )}
    </div>
  );
}
