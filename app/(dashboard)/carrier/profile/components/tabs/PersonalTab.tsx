'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

interface PersonalInfo {
  date_of_birth?: string;
  ssn_last_4?: string;
  photo_url?: string;
}

export function PersonalTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const [formData, setFormData] = useState<PersonalInfo>({
    date_of_birth: '',
    ssn_last_4: '',
    photo_url: '',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (profile && !isReady) {
      setFormData({
        date_of_birth: profile.date_of_birth || '',
        ssn_last_4: profile.ssn_last_4 || '',
        photo_url: profile.photo_url || '',
      });
      setIsReady(true);
    }
  }, [profile, isReady]);

  const updateMutation = useMutation({
    mutationFn: (data: PersonalInfo) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Personal info saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In real implementation, upload to Supabase/S3 and get URL
    // For now, create a data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
      toast.success('Photo uploaded');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-3">
          Profile Photo (Selfie)
        </label>
        <div className="flex items-start gap-6">
          {formData.photo_url ? (
            <img
              src={formData.photo_url}
              alt="Profile"
              className="w-20 h-20 rounded-lg object-cover border border-[var(--color-cream-dark)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-[var(--color-cream)] border-2 border-dashed border-[var(--color-cream-dark)] flex items-center justify-center">
              <span className="text-xs text-[var(--color-text-faint)]">No photo</span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text-muted)] mb-2">
              Upload a clear selfie for identity verification. Required for background checks.
            </p>
            <label className="inline-block cursor-pointer rounded-lg bg-[var(--color-cream)] border border-[var(--color-cream-dark)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors">
              Choose photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          className={inputCls}
        />
        <p className="text-xs text-[var(--color-text-faint)] mt-1">Required for identity verification</p>
      </div>

      {/* SSN Last 4 */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
          Social Security Number (Last 4 Digits)
        </label>
        <input
          type="text"
          maxLength={4}
          value={formData.ssn_last_4}
          onChange={(e) => setFormData(prev => ({ ...prev, ssn_last_4: e.target.value.replace(/\D/g, '') }))}
          className={inputCls}
          placeholder="1234"
        />
        <p className="text-xs text-[var(--color-text-faint)] mt-1">Only last 4 digits stored. Full SSN required only for Stripe payouts.</p>
      </div>

      <button
        onClick={() => updateMutation.mutate(formData)}
        disabled={updateMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
      >
        {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {updateMutation.isPending ? 'Saving…' : 'Save Personal Info'}
      </button>
    </div>
  );
}
