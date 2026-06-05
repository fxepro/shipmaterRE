'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function InsuranceTab() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['carrier-documents'],
    queryFn: () => api.get('/api/v1/carrier/documents').then(r => r.data?.data || []),
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/api/v1/carrier/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-documents'] });
      toast.success('Document uploaded');
    },
    onError: () => toast.error('Failed to upload'),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const autoInsurance = documents.find((d: any) => d.type === 'commercial_auto_insurance');
  const cargoInsurance = documents.find((d: any) => d.type === 'cargo_insurance');

  return (
    <div className="space-y-6">
      {/* Minimum Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Minimum Requirements</h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-center gap-2">
            <span>✓</span>
            <span>Commercial Auto Insurance: $750,000 (freight) or $1,000,000+ (HazMat)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>✓</span>
            <span>Cargo Insurance: Recommended ($50,000+)</span>
          </li>
          <li className="flex items-center gap-2">
            <span>✓</span>
            <span>Certificate of Insurance (COI) as proof</span>
          </li>
        </ul>
      </div>

      {/* Commercial Auto Insurance */}
      <DocumentUploadCard
        title="Commercial Auto Insurance"
        description="Liability coverage for your vehicle and cargo"
        document={autoInsurance}
        type="commercial_auto_insurance"
        required={true}
        isPending={uploadMutation.isPending}
        onUpload={(file) => {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('type', 'commercial_auto_insurance');
          formData.append('name', file.name);
          uploadMutation.mutate(formData);
        }}
      />

      {/* Cargo Insurance */}
      <DocumentUploadCard
        title="Cargo Insurance"
        description="Protection for freight being transported"
        document={cargoInsurance}
        type="cargo_insurance"
        required={false}
        isPending={uploadMutation.isPending}
        onUpload={(file) => {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('type', 'cargo_insurance');
          formData.append('name', file.name);
          uploadMutation.mutate(formData);
        }}
      />

      {/* Info */}
      <div className="text-xs text-[var(--color-text-faint)] space-y-2">
        <p>💡 Upload clear photos or PDFs of your insurance certificates.</p>
        <p>Insurance documents are kept confidential and used only for verification purposes.</p>
      </div>
    </div>
  );
}

interface DocumentUploadCardProps {
  title: string;
  description: string;
  document?: any;
  type: string;
  required: boolean;
  isPending: boolean;
  onUpload: (file: File) => void;
}

function DocumentUploadCard({
  title,
  description,
  document,
  required,
  isPending,
  onUpload,
}: DocumentUploadCardProps) {
  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
            {title}
            {required && <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>
        </div>
      </div>

      {document ? (
        <div className="flex items-center gap-3 p-4 bg-[var(--color-cream)] rounded-lg border border-[var(--color-cream-dark)]">
          <CheckCircle size={20} className="text-[var(--color-success)]" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">{document.name}</p>
            {document.expiry_date && (
              <p className="text-xs text-[var(--color-text-faint)]">
                Expires {new Date(document.expiry_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <button className="text-xs font-medium text-[var(--color-teal)] hover:underline">
            Replace
          </button>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-[var(--color-cream-dark)] rounded-lg p-8 text-center hover:border-[var(--color-teal)] cursor-pointer transition-colors">
          <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-faint)]" />
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Drag file here or click to browse</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">PDF or image, max 10 MB</p>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            disabled={isPending}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
