'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

interface MedicalInfo {
  dot_medical_expiry?: string;
  drug_test_date?: string;
  drug_test_result?: string;
}

export function MedicalTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const [formData, setFormData] = useState<MedicalInfo>({
    dot_medical_expiry: '',
    drug_test_date: '',
    drug_test_result: 'passed',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (profile && !isReady) {
      setFormData({
        dot_medical_expiry: profile.dot_medical_expiry || '',
        drug_test_date: profile.drug_test_date || '',
        drug_test_result: profile.drug_test_result || 'passed',
      });
      setIsReady(true);
    }
  }, [profile, isReady]);

  const updateMutation = useMutation({
    mutationFn: (data: MedicalInfo) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Medical information saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  // Check if medical cert is expired
  const medicalExpiry = formData.dot_medical_expiry ? new Date(formData.dot_medical_expiry) : null;
  const isExpired = medicalExpiry && medicalExpiry < new Date();
  const expiresIn30Days = medicalExpiry && medicalExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* DOT Medical Certificate */}
      <div>
        <h3 className="font-semibold text-[var(--color-text)] mb-4">DOT Medical Certificate</h3>

        {isExpired && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Certificate Expired</p>
              <p className="text-sm text-red-800">You must renew your DOT medical certificate to continue operating.</p>
            </div>
          </div>
        )}

        {expiresIn30Days && !isExpired && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Expires Soon</p>
              <p className="text-sm text-yellow-800">Your medical certificate expires within 30 days. Please schedule a renewal.</p>
            </div>
          </div>
        )}

        <div className="bg-[var(--color-cream)] rounded-lg p-4 mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
            Expiry Date
          </label>
          <input
            type="date"
            value={formData.dot_medical_expiry}
            onChange={(e) => setFormData(prev => ({ ...prev, dot_medical_expiry: e.target.value }))}
            className={inputCls}
          />
          {medicalExpiry && (
            <p className="text-xs text-[var(--color-text-faint)] mt-2">
              {isExpired ? 'Expired on' : 'Expires on'} {medicalExpiry.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Drug & Alcohol Testing */}
      <div className="border-t border-[var(--color-cream-dark)] pt-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-4">Drug & Alcohol Testing</h3>

        <div className="bg-[var(--color-cream)] rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
              Last Test Date
            </label>
            <input
              type="date"
              value={formData.drug_test_date}
              onChange={(e) => setFormData(prev => ({ ...prev, drug_test_date: e.target.value }))}
              className={inputCls}
            />
            <p className="text-xs text-[var(--color-text-faint)] mt-2">Optional - for reference</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-1.5">
              Test Result
            </label>
            <select
              value={formData.drug_test_result}
              onChange={(e) => setFormData(prev => ({ ...prev, drug_test_result: e.target.value }))}
              className={inputCls}
            >
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="not_tested">Not tested</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Note:</strong> Shippers may request proof of recent testing. Maintaining a clean record helps you win more jobs.
          </p>
        </div>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={true}
          className="w-4 h-4 rounded border-[var(--color-cream-dark)] mt-1"
        />
        <span className="text-sm text-[var(--color-text-muted)]">
          I consent to drug and alcohol testing as required by law and platform policy.
        </span>
      </label>

      <button
        onClick={() => updateMutation.mutate(formData)}
        disabled={updateMutation.isPending}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
      >
        {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
        {updateMutation.isPending ? 'Saving…' : 'Save Medical Information'}
      </button>
    </div>
  );
}
