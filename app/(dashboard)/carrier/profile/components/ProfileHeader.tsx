import { ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  verificationStatus?: string;
  completionPercentage?: number;
  carrierType?: string;
}

export function ProfileHeader({
  name = '—',
  email = '—',
  verificationStatus = 'incomplete',
  completionPercentage = 0,
  carrierType = 'sole_proprietor',
}: ProfileHeaderProps) {
  const statusConfig: Record<string, { color: string; label: string; bg: string }> = {
    incomplete: { color: 'text-red-700', label: 'Incomplete', bg: 'bg-red-50' },
    submitted: { color: 'text-yellow-700', label: 'Submitted', bg: 'bg-yellow-50' },
    in_review: { color: 'text-blue-700', label: 'In Review', bg: 'bg-blue-50' },
    verified: { color: 'text-green-700', label: 'Verified', bg: 'bg-green-50' },
    conditionally_verified: { color: 'text-green-700', label: 'Conditionally Verified', bg: 'bg-green-50' },
    suspended: { color: 'text-red-700', label: 'Suspended', bg: 'bg-red-50' },
  };

  const status = statusConfig[verificationStatus] || statusConfig.incomplete;

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">
            {name}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{email}</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-2">
            {carrierType === 'sole_proprietor' ? 'Owner-Operator' : 'Freight Company'}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${status.bg} ${status.color}`}>
          <ShieldCheck size={16} />
          {status.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">Profile Completion</span>
          <span className="text-xs font-medium text-[var(--color-text-muted)]">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-cream)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-teal)] transition-all duration-300 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
