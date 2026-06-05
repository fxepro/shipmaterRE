'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

interface DotInfo {
  cdl_number?: string;
  cdl_expiry_date?: string;
  cdl_class?: string;
  usdot_number?: string;
  mc_number?: string;
  hazmat_endorsement?: boolean;
  hazmat_expiry_date?: string;
}

export function DotCommercialTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const [formData, setFormData] = useState<DotInfo>({
    cdl_number: '',
    cdl_expiry_date: '',
    cdl_class: 'A',
    usdot_number: '',
    mc_number: '',
    hazmat_endorsement: false,
    hazmat_expiry_date: '',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (profile && !isReady) {
      setFormData({
        cdl_number: profile.cdl_number || '',
        cdl_expiry_date: profile.cdl_expiry_date || '',
        cdl_class: profile.cdl_class || 'A',
        usdot_number: profile.usdot_number || '',
        mc_number: profile.mc_number || '',
        hazmat_endorsement: profile.hazmat_endorsement || false,
        hazmat_expiry_date: profile.hazmat_expiry_date || '',
      });
      setIsReady(true);
    }
  }, [profile, isReady]);

  const updateMutation = useMutation({
    mutationFn: (data: DotInfo) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('DOT information saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">DOT-Commercial Information</p>
          <p className="text-sm text-blue-800 mt-1">
            This section is optional. Only complete it if you operate as an independent carrier authority.
            If you're an employee driver, you can skip this.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CDL Number */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            CDL Number
          </label>
          <input
            type="text"
            value={formData.cdl_number}
            onChange={(e) => setFormData(prev => ({ ...prev, cdl_number: e.target.value }))}
            className={inputCls}
            placeholder="e.g., 123456789"
          />
          <p className="text-xs text-[var(--color-text-faint)] mt-1">From your driver's license</p>
        </div>

        {/* CDL Class */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            CDL Class
          </label>
          <select
            value={formData.cdl_class}
            onChange={(e) => setFormData(prev => ({ ...prev, cdl_class: e.target.value as any }))}
            className={inputCls}
          >
            <option value="A">Class A (over 26,001 lbs)</option>
            <option value="B">Class B (up to 26,000 lbs)</option>
            <option value="C">Class C (specialized)</option>
          </select>
        </div>

        {/* CDL Expiry */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            CDL Expiry Date
          </label>
          <input
            type="date"
            value={formData.cdl_expiry_date}
            onChange={(e) => setFormData(prev => ({ ...prev, cdl_expiry_date: e.target.value }))}
            className={inputCls}
          />
        </div>

        {/* USDOT */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            USDOT Number (Optional)
          </label>
          <input
            type="text"
            value={formData.usdot_number}
            onChange={(e) => setFormData(prev => ({ ...prev, usdot_number: e.target.value }))}
            className={inputCls}
            placeholder="e.g., 1234567"
          />
          <p className="text-xs text-[var(--color-text-faint)] mt-1">For interstate operations</p>
        </div>

        {/* MC Number */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            MC Number (Optional)
          </label>
          <input
            type="text"
            value={formData.mc_number}
            onChange={(e) => setFormData(prev => ({ ...prev, mc_number: e.target.value }))}
            className={inputCls}
            placeholder="e.g., MC-123456"
          />
        </div>
      </div>

      {/* HazMat Endorsement */}
      <div className="border-t border-[var(--color-cream-dark)] pt-6">
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={formData.hazmat_endorsement}
            onChange={(e) => setFormData(prev => ({ ...prev, hazmat_endorsement: e.target.checked }))}
            className="w-4 h-4 rounded border-[var(--color-cream-dark)]"
          />
          <span className="text-sm font-medium text-[var(--color-text)]">HazMat Endorsement</span>
        </label>

        {formData.hazmat_endorsement && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
              HazMat Expiry Date
            </label>
            <input
              type="date"
              value={formData.hazmat_expiry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, hazmat_expiry_date: e.target.value }))}
              className={inputCls}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => updateMutation.mutate(formData)}
        disabled={updateMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
      >
        {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {updateMutation.isPending ? 'Saving…' : 'Save DOT Information'}
      </button>
    </div>
  );
}
