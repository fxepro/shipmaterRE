'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, Check, Loader2, CheckCircle, AlertCircle, Clock, Plus, Trash2, Star } from 'lucide-react';
import ServiceTypeSelector from '@/components/carrier/ServiceTypeSelector';
import { getRelevantTabs, isFieldRequired, type ProfileTab } from '@/lib/serviceTypeRules';

// ── Vehicle types ─────────────────────────────────────────────────────────────
interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  type: string;
  vin: string;
  license_plate: string;
  license_plate_state: string;
  gvwr: string;
  max_payload: string;
  cargo_length: string;
  cargo_width: string;
  cargo_height: string;
  registration_expiry: string;
  liftgate: boolean;
  climate_controlled: boolean;
  enclosed: boolean;
  is_primary: boolean;
}

type Tab = 'personal' | 'dot' | 'financial' | 'background' | 'medical' | 'insurance' | 'vehicles';

// ── Shared helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, readOnly, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean; hint?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type} value={value} readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] transition-colors
          placeholder:text-[var(--color-text-faint)]
          focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/20
          ${readOnly ? 'bg-[var(--color-cream)] cursor-default text-[var(--color-text-muted)]' : ''}
        `}
      />
      {hint && <p className="text-xs text-[var(--color-text-faint)] mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-[var(--color-text)] mb-4">{children}</p>;
}

function Divider() {
  return <div className="border-t border-[var(--color-cream-dark)] pt-6 mt-2" />;
}

function UploadBox({ label, hint, required, docType, vehicleId }: {
  label: string; hint?: string; required?: boolean;
  docType: string; vehicleId?: number;
}) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('document', file);
      form.append('type', docType);
      form.append('name', file.name);
      if (vehicleId) form.append('vehicle_id', String(vehicleId));
      await api.post('/api/v1/carrier/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploaded(file.name);
      qc.invalidateQueries({ queryKey: ['carrier-documents'] });
      toast.success(`${label} uploaded`);
    } catch {
      toast.error(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Label>{label}</Label>
        {required && <span className="text-xs font-medium text-red-500 -mt-1.5">Required</span>}
      </div>
      {uploaded ? (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[var(--color-teal)] bg-[var(--color-teal-pale)]">
          <CheckCircle size={16} className="text-[var(--color-teal)]" />
          <span className="text-sm text-[var(--color-text)] flex-1 truncate">{uploaded}</span>
          <button onClick={() => setUploaded('')} className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-danger)]">Replace</button>
        </div>
      ) : (
        <label className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed cursor-pointer transition-colors ${
          uploading ? 'border-[var(--color-teal)] bg-[var(--color-teal-pale)]' : 'border-[var(--color-cream-dark)] bg-[var(--color-cream)] hover:border-[var(--color-teal)]'
        }`}>
          {uploading ? <Loader2 size={16} className="text-[var(--color-teal)] animate-spin" /> : <Upload size={16} className="text-[var(--color-text-faint)]" />}
          <span className="text-sm text-[var(--color-text-muted)]">{uploading ? 'Uploading…' : 'Click to upload — PDF or image, max 10 MB'}</span>
          <input type="file" accept=".pdf,image/*" className="hidden" disabled={uploading} onChange={handleFile} />
        </label>
      )}
      {hint && <p className="text-xs text-[var(--color-text-faint)] mt-1">{hint}</p>}
    </div>
  );
}

function SaveBar({ saved, onSave, isPending }: { saved: boolean; onSave: () => void; isPending?: boolean }) {
  return (
    <div className="flex items-center justify-end pt-4 border-t border-[var(--color-cream-dark)]">
      <button onClick={onSave} disabled={isPending}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${
          saved
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-light)] shadow-sm'
        }`}>
        {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
          : saved ? <><Check size={15} /> Saved</>
          : 'Save changes'}
      </button>
    </div>
  );
}

// ── Financial Tab ─────────────────────────────────────────────────────────────

function FinancialTab({ stripeStatus }: { stripeStatus: string }) {
  const qc = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    try {
      setConnecting(true);
      const res = await api.post('/api/v1/stripe/connect/onboard');
      // Open Stripe Express in same tab — Stripe redirects back to return_url
      window.location.href = res.data.url;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to start Stripe onboarding';
      alert(msg);
      setConnecting(false);
    }
  }

  async function handleRefreshStatus() {
    try {
      await api.get('/api/v1/stripe/connect/status');
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
    } catch { /* ignore */ }
  }

  const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    not_connected: { label: 'Not connected', color: 'text-[var(--color-text-faint)]', icon: <AlertCircle size={16} className="text-[var(--color-warning)]" /> },
    pending:       { label: 'Verification pending', color: 'text-blue-700', icon: <Loader2 size={16} className="text-blue-500 animate-spin" /> },
    verified:      { label: 'Connected & verified', color: 'text-[var(--color-success)]', icon: <CheckCircle size={16} className="text-[var(--color-success)]" /> },
    restricted:    { label: 'Action required', color: 'text-red-700', icon: <AlertCircle size={16} className="text-red-500" /> },
  };

  const s = statusMap[stripeStatus] ?? statusMap.not_connected;

  return (
    <div className="space-y-6">
      <SectionTitle>Stripe Connect — Bank Payouts</SectionTitle>

      <div className="rounded-xl border border-[var(--color-cream-dark)] p-6 space-y-4">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {s.icon}
            <span className={`text-sm font-medium ${s.color}`}>{s.label}</span>
          </div>
          {stripeStatus !== 'not_connected' && (
            <button onClick={handleRefreshStatus} className="text-xs text-[var(--color-teal)] hover:underline">
              Refresh status
            </button>
          )}
        </div>

        <p className="text-sm text-[var(--color-text-muted)]">
          Link your bank account or debit card to receive payments from completed shipments.
          Funds are held in escrow and released on delivery confirmation.
          Stripe handles all payment processing and identity verification.
        </p>

        {/* What Stripe collects */}
        <div className="rounded-lg bg-[var(--color-cream)] border border-[var(--color-cream-dark)] p-4 space-y-1.5 text-sm text-[var(--color-text-muted)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)] mb-2">Stripe will collect</p>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-teal)] shrink-0" /> Full SSN — for identity verification and 1099-NEC tax reporting</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-teal)] shrink-0" /> Bank account routing + account number (ACH) for standard payouts</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-teal)] shrink-0" /> Debit card — for instant payouts</div>
          <div className="flex items-center gap-2"><CheckCircle size={14} className="text-[var(--color-teal)] shrink-0" /> Date of birth + address — for identity verification</div>
        </div>

        {stripeStatus === 'not_connected' && (
          <button onClick={handleConnect} disabled={connecting}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-teal-light)] disabled:opacity-60">
            {connecting ? <><Loader2 size={14} className="animate-spin" /> Opening Stripe…</> : 'Connect Bank Account'}
          </button>
        )}

        {stripeStatus === 'pending' && (
          <button onClick={handleConnect} disabled={connecting}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-teal)] text-[var(--color-teal)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-teal-pale)] disabled:opacity-60">
            {connecting ? <><Loader2 size={14} className="animate-spin" /> Opening Stripe…</> : 'Continue Stripe Setup'}
          </button>
        )}

        {stripeStatus === 'restricted' && (
          <button onClick={handleConnect} disabled={connecting}
            className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
            {connecting ? <><Loader2 size={14} className="animate-spin" /> Opening Stripe…</> : 'Resolve Issues in Stripe'}
          </button>
        )}
      </div>

      <div className="border-t border-[var(--color-cream-dark)] pt-6">
        <SectionTitle>1099-NEC Tax Reporting</SectionTitle>
        <p className="text-sm text-[var(--color-text-muted)]">
          If you earn over $600 in a calendar year on Shipmater, we are required to issue a 1099-NEC.
          Your full SSN is collected and stored securely by Stripe — never on our servers.
        </p>
        <div className={`mt-4 rounded-lg p-4 flex items-center gap-3 text-sm font-medium ${
          stripeStatus === 'verified'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-[var(--color-cream)] border border-[var(--color-cream-dark)] text-[var(--color-text-muted)]'
        }`}>
          {stripeStatus === 'verified'
            ? <><CheckCircle size={16} className="text-[var(--color-success)]" /> Tax information collected — W-9 on file via Stripe</>
            : <><AlertCircle size={16} className="text-[var(--color-warning)]" /> Complete Stripe Connect above — Stripe will collect your SSN and W-9 during that flow</>
          }
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CarrierProfilePage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['carrier-profile'],
    queryFn: () => api.get('/api/v1/carrier/profile').then(r => r.data?.data),
    retry: false,
  });

  // Handle Stripe Connect return
  useEffect(() => {
    const stripeResult = searchParams.get('stripe');
    if (stripeResult === 'success') {
      setActiveTab('financial');
      api.get('/api/v1/stripe/connect/status').then(() => {
        qc.invalidateQueries({ queryKey: ['carrier-profile'] });
        toast.success('Stripe account connected!');
      });
      router.replace('/carrier/profile');
    } else if (stripeResult === 'refresh') {
      setActiveTab('financial');
      toast.error('Stripe setup incomplete — please try again.');
      router.replace('/carrier/profile');
    }
  }, [searchParams]); // eslint-disable-line

  const [serviceTypeKeys, setServiceTypeKeys] = useState<string[]>([]);
  const [serviceTypesSaving, setServiceTypesSaving] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    first_name: '', middle_name: '', last_name: '', suffix: '',
    date_of_birth: '', ssn: '', phone: '',
    street: '', city: '', state: '', zip: '',
    id_type: 'dl', dl_number: '', dl_state: '', dl_expiry: '',
    passport_number: '', passport_expiry: '',
  });

  const [dotForm, setDotForm] = useState({
    cdl_number: '', cdl_issuing_state: '', cdl_expiry_date: '', cdl_class: 'A',
    usdot_number: '', mc_number: '',
    hazmat_endorsement: false, hazmat_expiry_date: '',
    tanker_endorsement: false,
    passenger_endorsement: false,
  });

  const [medicalForm, setMedicalForm] = useState({
    medical_examiner_name: '',
    dot_medical_expiry: '',
    drug_test_date: '',
    drug_test_result: 'passed',
  });

  // Insurance state
  const [insuranceForm, setInsuranceForm] = useState({
    auto_policy_number: '', auto_insurer: '', auto_coverage: '', auto_effective: '', auto_expiry: '',
    cargo_policy_number: '', cargo_insurer: '', cargo_coverage: '', cargo_expiry: '',
  });
  const [insuranceSaved, setInsuranceSaved] = useState(false);
  const insuranceMutation = useMutation({
    mutationFn: () => api.put('/api/v1/carrier/profile', {
      auto_policy_number: insuranceForm.auto_policy_number,
      auto_insurer_name: insuranceForm.auto_insurer,
      auto_coverage_amount: insuranceForm.auto_coverage,
      auto_effective_date: insuranceForm.auto_effective,
      auto_expiry_date: insuranceForm.auto_expiry,
      cargo_policy_number: insuranceForm.cargo_policy_number,
      cargo_insurer_name: insuranceForm.cargo_insurer,
      cargo_coverage_amount: insuranceForm.cargo_coverage,
      cargo_expiry_date: insuranceForm.cargo_expiry,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      setInsuranceSaved(true);
      setTimeout(() => setInsuranceSaved(false), 2000);
      toast.success('Insurance information saved');
    },
    onError: () => toast.error('Failed to save insurance'),
  });

  // Vehicles — fetched from API
  const { data: vehiclesData = [] } = useQuery({
    queryKey: ['carrier-vehicles'],
    queryFn: () => api.get('/api/v1/carrier/vehicles').then(r => r.data?.data ?? []),
    retry: false,
  });
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const newVehicle = (isPrimary: boolean): Vehicle => ({
    id: '',
    year: new Date().getFullYear().toString(),
    make: '', model: '', type: 'box_truck',
    vin: '', license_plate: '', license_plate_state: '',
    gvwr: '', max_payload: '',
    cargo_length: '', cargo_width: '', cargo_height: '',
    registration_expiry: '',
    liftgate: false, climate_controlled: false, enclosed: false,
    is_primary: isPrimary,
  });
  const [vehicleForm, setVehicleForm] = useState<Vehicle>(newVehicle(true));

  const addVehicleMutation = useMutation({
    mutationFn: (data: Omit<Vehicle, 'id'>) => api.post('/api/v1/carrier/vehicles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-vehicles'] });
      setShowAddVehicle(false);
      setVehicleForm(newVehicle(false));
      toast.success('Vehicle added');
    },
    onError: () => toast.error('Failed to add vehicle'),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/carrier/vehicles/${id}`, { is_primary: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['carrier-vehicles'] }),
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/carrier/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['carrier-vehicles'] }),
    onError: () => toast.error('Failed to delete vehicle'),
  });

  useEffect(() => {
    if (profile?.service_type_keys) {
      setServiceTypeKeys(profile.service_type_keys);
    }
  }, [profile?.service_type_keys]);

  async function saveServiceTypes(keys: string[]) {
    setServiceTypeKeys(keys);
    setServiceTypesSaving(true);
    try {
      await api.put('/api/v1/carrier/profile', { service_type_keys: keys });
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      toast.success('Service types saved');
    } catch {
      toast.error('Failed to save service types');
    } finally {
      setServiceTypesSaving(false);
    }
  }

  useEffect(() => {
    if (profile) {
      const parts = (profile.name || '').trim().split(/\s+/);
      setPersonalForm(prev => ({
        ...prev,
        first_name:  parts[0] || '',
        middle_name: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
        last_name:   parts.length > 1 ? parts[parts.length - 1] : '',
        date_of_birth: profile.date_of_birth || '',
        phone: profile.phone || '',
      }));
      setDotForm({
        cdl_number: profile.cdl_number || '',
        cdl_issuing_state: profile.cdl_issuing_state || '',
        cdl_expiry_date: profile.cdl_expiry_date || '',
        cdl_class: profile.cdl_class || 'A',
        usdot_number: profile.usdot_number || '',
        mc_number: profile.mc_number || '',
        hazmat_endorsement: profile.hazmat_endorsement || false,
        hazmat_expiry_date: profile.hazmat_expiry_date || '',
        tanker_endorsement: profile.tanker_endorsement || false,
        passenger_endorsement: profile.passenger_endorsement || false,
      });
      setMedicalForm({
        medical_examiner_name: profile.medical_examiner_name || '',
        dot_medical_expiry: profile.dot_medical_expiry || '',
        drug_test_date: profile.drug_test_date || '',
        drug_test_result: profile.drug_test_result || 'passed',
      });
      setInsuranceForm({
        auto_policy_number: profile.auto_policy_number || '',
        auto_insurer:       profile.auto_insurer_name  || '',
        auto_coverage:      profile.auto_coverage_amount ? String(profile.auto_coverage_amount) : '',
        auto_effective:     profile.auto_effective_date || '',
        auto_expiry:        profile.auto_expiry_date   || '',
        cargo_policy_number: profile.cargo_policy_number || '',
        cargo_insurer:       profile.cargo_insurer_name  || '',
        cargo_coverage:      profile.cargo_coverage_amount ? String(profile.cargo_coverage_amount) : '',
        cargo_expiry:        profile.cargo_expiry_date   || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/api/v1/carrier/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) return <div className="py-12 text-center">Loading...</div>;
  if (isError || !profile) return <div className="py-12 text-center text-red-600">Error loading profile</div>;

  const save = (data: any) => updateMutation.mutate(data);

  const relevantTabs = serviceTypeKeys.length > 0
    ? getRelevantTabs(serviceTypeKeys)
    : (['personal', 'dot_commercial', 'insurance', 'financial', 'background', 'medical'] as ProfileTab[]);

  const ALL_TABS: { id: Tab; label: string; profileTab: ProfileTab | null }[] = [
    { id: 'personal',   label: 'Personal',        profileTab: 'personal' },
    { id: 'dot',        label: 'DOT-Commercial',   profileTab: 'dot_commercial' },
    { id: 'insurance',  label: 'Insurance',        profileTab: 'insurance' },
    { id: 'medical',    label: 'Medical',          profileTab: 'medical' },
    { id: 'financial',  label: 'Financial',        profileTab: 'financial' },
    { id: 'background', label: 'Background',       profileTab: 'background' },
    { id: 'vehicles',   label: 'Vehicles',         profileTab: null },
  ];

  const tabs = ALL_TABS.filter(t =>
    t.profileTab === null || relevantTabs.includes(t.profileTab)
  );

  const initials = (() => {
    const parts = profile.name.trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  })();

  return (
    <div className="w-[75%] min-w-[560px] space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-slate)]" style={{ fontFamily: 'var(--font-display)' }}>
          Account Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage your profile, verification documents, payments, and vehicles
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-slate)] flex items-center justify-center text-white text-lg font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold text-[var(--color-text)]">{profile.name}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {profile.carrier_type === 'sole_proprietor' ? 'Owner-Operator' : 'Freight Company'}
          </p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">Member since {profile.member_since}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--color-text)]">{profile.completion_percentage}%</p>
          <p className="text-xs text-[var(--color-text-faint)]">Complete</p>
          <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            profile.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {profile.verification_status === 'verified' ? 'Verified' : 'Incomplete'}
          </span>
        </div>
      </div>

      {/* Service type selector */}
      <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">What do you transport?</h2>
          {serviceTypesSaving && (
            <span className="text-xs text-[var(--color-text-faint)] flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Saving…
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Select all that apply. This determines your required certifications and helps shippers find you.
        </p>
        <ServiceTypeSelector
          selected={serviceTypeKeys}
          onChange={saveServiceTypes}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-cream-dark)]">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--color-teal)] text-[var(--color-teal)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-xl p-8">

        {/* ── PERSONAL ──────────────────────────────────────────────────── */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <SectionTitle>Legal Name</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={personalForm.first_name} onChange={v => setPersonalForm(p => ({...p, first_name: v}))} placeholder="John" />
              <Field label="Middle Name" value={personalForm.middle_name} onChange={v => setPersonalForm(p => ({...p, middle_name: v}))} placeholder="Optional" />
              <Field label="Last Name" value={personalForm.last_name} onChange={v => setPersonalForm(p => ({...p, last_name: v}))} placeholder="Smith" />
              <div>
                <Label>Suffix</Label>
                <select value={personalForm.suffix} onChange={e => setPersonalForm(p => ({...p, suffix: e.target.value}))}
                  className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none">
                  <option value="">None</option>
                  <option>Jr.</option><option>Sr.</option>
                  <option>II</option><option>III</option><option>IV</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Contact Information</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email Address" value={profile.email} readOnly />
                <Field label="Phone Number" value={personalForm.phone} onChange={v => setPersonalForm(p => ({...p, phone: v}))} type="tel" />
              </div>
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Current Address</SectionTitle>
              <p className="text-xs text-[var(--color-text-faint)] mb-4">Required for county-level background check</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Street Address" value={personalForm.street} onChange={v => setPersonalForm(p => ({...p, street: v}))} placeholder="3600 Brighton Blvd" />
                </div>
                <Field label="City" value={personalForm.city} onChange={v => setPersonalForm(p => ({...p, city: v}))} placeholder="Denver" />
                <Field label="State" value={personalForm.state} onChange={v => setPersonalForm(p => ({...p, state: v}))} placeholder="CO" />
                <Field label="ZIP Code" value={personalForm.zip} onChange={v => setPersonalForm(p => ({...p, zip: v}))} placeholder="80216" />
              </div>
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Government-Issued ID</SectionTitle>
              <p className="text-xs text-[var(--color-text-faint)] mb-4">Required for identity verification and background check</p>
              <div className="flex gap-3 mb-4">
                {(['dl', 'passport'] as const).map(t => (
                  <button key={t} onClick={() => setPersonalForm(p => ({...p, id_type: t}))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      personalForm.id_type === t
                        ? 'bg-[var(--color-teal)] text-white border-[var(--color-teal)]'
                        : 'bg-[var(--color-cream)] text-[var(--color-text-muted)] border-[var(--color-cream-dark)]'
                    }`}>
                    {t === 'dl' ? "Driver's License" : 'Passport'}
                  </button>
                ))}
              </div>

              {personalForm.id_type === 'dl' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="DL Number" value={personalForm.dl_number} onChange={v => setPersonalForm(p => ({...p, dl_number: v}))} placeholder="D1234567" />
                    <Field label="Issuing State" value={personalForm.dl_state} onChange={v => setPersonalForm(p => ({...p, dl_state: v}))} placeholder="CO" />
                    <Field label="Expiry Date" value={personalForm.dl_expiry} onChange={v => setPersonalForm(p => ({...p, dl_expiry: v}))} type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <UploadBox label="DL Front" required docType="dl_front" />
                    <UploadBox label="DL Back"  required docType="dl_back" />
                  </div>
                  <UploadBox label="Selfie (for identity matching)" required docType="selfie" hint="Clear photo of your face. Must match your ID." />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Passport Number" value={personalForm.passport_number} onChange={v => setPersonalForm(p => ({...p, passport_number: v}))} placeholder="US1234567" />
                    <Field label="Expiry Date" value={personalForm.passport_expiry} onChange={v => setPersonalForm(p => ({...p, passport_expiry: v}))} type="date" />
                  </div>
                  <UploadBox label="Passport Photo Page" required docType="passport" />
                  <UploadBox label="Selfie (for identity matching)" required docType="selfie" hint="Clear photo of your face. Must match your passport." />
                </div>
              )}
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Date of Birth</SectionTitle>
              <div className="max-w-xs">
                <Field label="Date of Birth" value={personalForm.date_of_birth} onChange={v => setPersonalForm(p => ({...p, date_of_birth: v}))} type="date" />
              </div>
            </div>

            <SaveBar saved={saved} onSave={() => {
              const fullName = [personalForm.first_name, personalForm.middle_name, personalForm.last_name, personalForm.suffix].filter(Boolean).join(' ');
              save({ name: fullName, phone: personalForm.phone, date_of_birth: personalForm.date_of_birth });
            }} isPending={updateMutation.isPending} />
          </div>
        )}

        {/* ── DOT-COMMERCIAL ────────────────────────────────────────────── */}
        {activeTab === 'dot' && (
          <div className="space-y-6">
            <SectionTitle>Commercial Driver License</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CDL Number" value={dotForm.cdl_number} onChange={v => setDotForm(p => ({...p, cdl_number: v}))} />
              <Field label="Issuing State" value={dotForm.cdl_issuing_state} onChange={v => setDotForm(p => ({...p, cdl_issuing_state: v}))} placeholder="CO" />
              <div>
                <Label>CDL Class</Label>
                <select value={dotForm.cdl_class} onChange={e => setDotForm(p => ({...p, cdl_class: e.target.value}))}
                  className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none">
                  <option value="A">Class A — Over 26,001 lbs</option>
                  <option value="B">Class B — Up to 26,000 lbs</option>
                  <option value="C">Class C — Specialized</option>
                </select>
              </div>
              <Field label="CDL Expiry Date" value={dotForm.cdl_expiry_date} onChange={v => setDotForm(p => ({...p, cdl_expiry_date: v}))} type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <UploadBox label="CDL Front" required docType="cdl_front" />
              <UploadBox label="CDL Back"  required docType="cdl_back" />
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Endorsements</SectionTitle>
              <div className="space-y-3">
                {([
                  ['hazmat_endorsement', 'HazMat', true],
                  ['tanker_endorsement', 'Tanker', false],
                  ['passenger_endorsement', 'Passenger', false],
                ] as [keyof typeof dotForm, string, boolean][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={!!dotForm[key]}
                        onChange={e => setDotForm(p => ({...p, [key]: e.target.checked}))}
                        className="w-4 h-4 rounded accent-[var(--color-teal)]" />
                      <span className="text-sm font-medium text-[var(--color-text)]">{label} Endorsement</span>
                    </label>
                    {key === 'hazmat_endorsement' && dotForm.hazmat_endorsement && (
                      <div className="mt-3 ml-7 max-w-xs">
                        <Field label="HazMat Expiry Date" value={dotForm.hazmat_expiry_date} onChange={v => setDotForm(p => ({...p, hazmat_expiry_date: v}))} type="date" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Operating Authority <span className="text-xs font-normal text-[var(--color-text-faint)] ml-1">— Optional, only if operating as independent authority</span></SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="USDOT Number" value={dotForm.usdot_number} onChange={v => setDotForm(p => ({...p, usdot_number: v}))} placeholder="1234567" />
                <Field label="MC Number" value={dotForm.mc_number} onChange={v => setDotForm(p => ({...p, mc_number: v}))} placeholder="MC-123456" />
              </div>
            </div>

            <SaveBar saved={saved} onSave={() => save(dotForm)} isPending={updateMutation.isPending} />
          </div>
        )}

        {/* ── FINANCIAL ─────────────────────────────────────────────────── */}
        {activeTab === 'financial' && (
          <FinancialTab stripeStatus={profile.stripe_account_status} />
        )}

        {/* ── BACKGROUND ────────────────────────────────────────────────── */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            <SectionTitle>Background Check</SectionTitle>
            <p className="text-sm text-[var(--color-text-muted)]">
              We use Checkr to run criminal, MVR, OFAC, and sex offender registry checks. The following information is required to initiate.
            </p>

            {/* Prerequisites status */}
            <div className="rounded-xl border border-[var(--color-cream-dark)] divide-y divide-[var(--color-cream-dark)]">
              {[
                { label: 'Legal name',                                              done: !!(profile.name) },
                { label: "Driver's License number",                                  done: !!(profile.cdl_number) },
                { label: 'Date of birth',                                           done: !!(profile.date_of_birth) },
                { label: 'Home address',                                            done: !!(personalForm.street && personalForm.city) },
                { label: 'Full SSN — collected securely by Checkr, never stored',  done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {item.done
                    ? <CheckCircle size={16} className="text-[var(--color-success)] shrink-0" />
                    : <Clock size={16} className="text-[var(--color-warning)] shrink-0" />}
                  <span className={`text-sm ${item.done ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{item.label}</span>
                  {!item.done && <span className="ml-auto text-xs text-[var(--color-text-faint)]">Missing</span>}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--color-cream-dark)] p-6">
              <SectionTitle>What We Check</SectionTitle>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li className="flex items-start gap-2"><span className="text-[var(--color-teal)]">✓</span> Criminal background — national, federal, and county level</li>
                <li className="flex items-start gap-2"><span className="text-[var(--color-teal)]">✓</span> Motor Vehicle Record (MVR) — driving history, violations, suspensions, DUI</li>
                <li className="flex items-start gap-2"><span className="text-[var(--color-teal)]">✓</span> OFAC / Terrorist watchlist screening</li>
                <li className="flex items-start gap-2"><span className="text-[var(--color-teal)]">✓</span> Sex offender registry</li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Status</p>
                <p className="text-xs text-[var(--color-text-faint)] mt-0.5">Typically takes 3–5 business days</p>
              </div>
              <button
                disabled={!profile.name || !profile.date_of_birth || !profile.cdl_number}
                className="rounded-lg bg-[var(--color-teal)] text-white px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-[var(--color-teal-light)]"
                title={!profile.name || !profile.date_of_birth || !profile.cdl_number ? 'Complete Personal and DOT tabs first' : 'Run background check'}
                onClick={() => toast.info('Background check integration coming — Checkr API key required')}
              >
                Run Background Check
              </button>
            </div>
          </div>
        )}

        {/* ── MEDICAL ───────────────────────────────────────────────────── */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <SectionTitle>DOT Medical Certificate</SectionTitle>
            <p className="text-sm text-[var(--color-text-muted)]">Required for all CDL holders. Must be renewed before expiry or your account will be suspended.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issuing Medical Examiner Name" value={medicalForm.medical_examiner_name} onChange={v => setMedicalForm(p => ({...p, medical_examiner_name: v}))} placeholder="Dr. Jane Smith" />
              <Field label="Expiry Date" value={medicalForm.dot_medical_expiry} onChange={v => setMedicalForm(p => ({...p, dot_medical_expiry: v}))} type="date" />
            </div>
            <UploadBox label="DOT Medical Certificate" required docType="medical_cert" hint="Upload the physical certificate issued by your medical examiner." />

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Drug & Alcohol Testing</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Last Test Date" value={medicalForm.drug_test_date} onChange={v => setMedicalForm(p => ({...p, drug_test_date: v}))} type="date" />
                <div>
                  <Label>Result</Label>
                  <select value={medicalForm.drug_test_result} onChange={e => setMedicalForm(p => ({...p, drug_test_result: e.target.value}))}
                    className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none">
                    <option value="passed">Passed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 mt-0.5 rounded accent-[var(--color-teal)]" />
              <span className="text-sm text-[var(--color-text-muted)]">I consent to drug and alcohol testing as required by federal law and platform policy.</span>
            </label>

            <SaveBar saved={saved} onSave={() => save(medicalForm)} isPending={updateMutation.isPending} />
          </div>
        )}

        {/* ── INSURANCE ─────────────────────────────────────────────────── */}
        {activeTab === 'insurance' && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
              <strong>Minimums:</strong> $750,000 commercial auto (general freight) · $1,000,000+ (HazMat) · Cargo insurance recommended
            </div>

            <SectionTitle>Commercial Auto Insurance</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Policy Number"     value={insuranceForm.auto_policy_number} onChange={v => setInsuranceForm(p => ({...p, auto_policy_number: v}))} />
              <Field label="Insurer Name"       value={insuranceForm.auto_insurer}       onChange={v => setInsuranceForm(p => ({...p, auto_insurer: v}))}       placeholder="Progressive Commercial" />
              <Field label="Coverage Amount ($)" value={insuranceForm.auto_coverage}     onChange={v => setInsuranceForm(p => ({...p, auto_coverage: v}))}     placeholder="750000" />
              <Field label="Effective Date"     value={insuranceForm.auto_effective}     onChange={v => setInsuranceForm(p => ({...p, auto_effective: v}))}     type="date" />
              <Field label="Expiry Date"        value={insuranceForm.auto_expiry}        onChange={v => setInsuranceForm(p => ({...p, auto_expiry: v}))}        type="date" />
            </div>
            <UploadBox label="Certificate of Insurance (COI)" required docType="insurance_auto" hint="Upload the Certificate of Insurance. Must be current." />

            <div className="border-t border-[var(--color-cream-dark)] pt-6">
              <SectionTitle>Cargo Insurance</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Policy Number"     value={insuranceForm.cargo_policy_number} onChange={v => setInsuranceForm(p => ({...p, cargo_policy_number: v}))} />
                <Field label="Insurer Name"       value={insuranceForm.cargo_insurer}       onChange={v => setInsuranceForm(p => ({...p, cargo_insurer: v}))} />
                <Field label="Coverage Amount ($)" value={insuranceForm.cargo_coverage}     onChange={v => setInsuranceForm(p => ({...p, cargo_coverage: v}))}   placeholder="50000" />
                <Field label="Expiry Date"        value={insuranceForm.cargo_expiry}        onChange={v => setInsuranceForm(p => ({...p, cargo_expiry: v}))}      type="date" />
              </div>
              <div className="mt-4">
                <UploadBox label="Cargo Insurance Certificate" docType="insurance_cargo" hint="Optional but strongly recommended." />
              </div>
            </div>

            <SaveBar saved={insuranceSaved} onSave={() => insuranceMutation.mutate()} isPending={insuranceMutation.isPending} />
          </div>
        )}

        {/* ── VEHICLES ──────────────────────────────────────────────────── */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <SectionTitle>Your Fleet</SectionTitle>
                <p className="text-xs text-[var(--color-text-faint)] -mt-3">{vehiclesData.length} vehicle{vehiclesData.length !== 1 ? 's' : ''} registered</p>
              </div>
              <button
                onClick={() => { setVehicleForm(newVehicle(vehiclesData.length === 0)); setShowAddVehicle(true); }}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-teal-light)]"
              >
                <Plus size={15} /> Add Vehicle
              </button>
            </div>

            {vehiclesData.length === 0 && !showAddVehicle && (
              <div className="text-center py-10 rounded-lg border-2 border-dashed border-[var(--color-cream-dark)]">
                <p className="text-sm text-[var(--color-text-muted)]">No vehicles yet</p>
                <p className="text-xs text-[var(--color-text-faint)] mt-1">Add your first truck or trailer to start bidding on jobs</p>
              </div>
            )}

            {vehiclesData.map((v: any) => (
              <div key={v.id} className="rounded-xl border border-[var(--color-cream-dark)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--color-text)]">{v.year} {v.make} {v.model}</p>
                      {v.is_primary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-teal-pale)] text-[var(--color-teal)] text-xs font-medium">
                          <Star size={11} fill="currentColor" /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-faint)] mt-0.5 capitalize">{v.type?.replace('_', ' ')} · {v.license_plate} {v.license_plate_state}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!v.is_primary && (
                      <button
                        onClick={() => setPrimaryMutation.mutate(String(v.id))}
                        disabled={setPrimaryMutation.isPending}
                        className="text-xs text-[var(--color-teal)] hover:underline disabled:opacity-50"
                      >
                        Set primary
                      </button>
                    )}
                    <button
                      onClick={() => deleteVehicleMutation.mutate(String(v.id))}
                      disabled={deleteVehicleMutation.isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-faint)] hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleteVehicleMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs text-[var(--color-text-muted)]">
                  <div><span className="text-[var(--color-text-faint)]">GVWR</span><br />{v.gvwr ? `${Number(v.gvwr).toLocaleString()} lbs` : '—'}</div>
                  <div><span className="text-[var(--color-text-faint)]">Payload</span><br />{v.max_payload ? `${Number(v.max_payload).toLocaleString()} lbs` : '—'}</div>
                  <div><span className="text-[var(--color-text-faint)]">Cargo (L×W×H)</span><br />
                    {v.cargo_length && v.cargo_width && v.cargo_height
                      ? `${v.cargo_length}" × ${v.cargo_width}" × ${v.cargo_height}"`
                      : '—'}
                  </div>
                  <div><span className="text-[var(--color-text-faint)]">VIN</span><br />{v.vin || '—'}</div>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {v.liftgate && <span className="px-1.5 py-0.5 rounded bg-[var(--color-cream)] text-xs text-[var(--color-text-faint)]">Liftgate</span>}
                  {v.climate_controlled && <span className="px-1.5 py-0.5 rounded bg-[var(--color-cream)] text-xs text-[var(--color-text-faint)]">Climate</span>}
                  {v.enclosed && <span className="px-1.5 py-0.5 rounded bg-[var(--color-cream)] text-xs text-[var(--color-text-faint)]">Enclosed</span>}
                  {v.registration_expiry && <span className="px-1.5 py-0.5 rounded bg-[var(--color-cream)] text-xs text-[var(--color-text-faint)]">Reg. exp. {v.registration_expiry}</span>}
                </div>
              </div>
            ))}

            {/* Add vehicle form */}
            {showAddVehicle && (
              <div className="rounded-xl border-2 border-[var(--color-teal)] p-6 space-y-5">
                <p className="font-semibold text-[var(--color-text)]">New Vehicle</p>

                {/* Year / Make / Model */}
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Year" value={vehicleForm.year} onChange={v => setVehicleForm(p => ({...p, year: v}))} placeholder={new Date().getFullYear().toString()} />
                  <Field label="Make" value={vehicleForm.make} onChange={v => setVehicleForm(p => ({...p, make: v}))} placeholder="Freightliner" />
                  <Field label="Model" value={vehicleForm.model} onChange={v => setVehicleForm(p => ({...p, model: v}))} placeholder="Cascadia" />
                </div>

                {/* Type */}
                <div>
                  <Label>Vehicle Type</Label>
                  <select value={vehicleForm.type} onChange={e => setVehicleForm(p => ({...p, type: e.target.value}))}
                    className="w-full rounded-xl border border-[var(--color-cream-dark)] bg-[var(--color-white)] px-3.5 py-2.5 text-sm text-[var(--color-text)] focus:border-[var(--color-teal)] focus:outline-none">
                    <option value="box_truck">Box Truck</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="enclosed_trailer">Enclosed Trailer</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="tanker">Tanker</option>
                    <option value="pickup_with_trailer">Pickup with Trailer</option>
                    <option value="step_deck">Step Deck</option>
                    <option value="lowboy">Lowboy</option>
                  </select>
                </div>

                {/* VIN / Plate */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="VIN" value={vehicleForm.vin} onChange={v => setVehicleForm(p => ({...p, vin: v}))} placeholder="1FUJA6CV17LY12345" />
                  <Field label="License Plate" value={vehicleForm.license_plate} onChange={v => setVehicleForm(p => ({...p, license_plate: v}))} placeholder="ABC-1234" />
                  <Field label="Plate State" value={vehicleForm.license_plate_state} onChange={v => setVehicleForm(p => ({...p, license_plate_state: v}))} placeholder="CO" />
                </div>

                {/* GVWR / Payload */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GVWR (lbs)" value={vehicleForm.gvwr} onChange={v => setVehicleForm(p => ({...p, gvwr: v}))} placeholder="80000" />
                  <Field label="Max Payload (lbs)" value={vehicleForm.max_payload} onChange={v => setVehicleForm(p => ({...p, max_payload: v}))} placeholder="45000" />
                </div>

                {/* Cargo Dimensions */}
                <div>
                  <Label>Cargo Dimensions (inches)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Length" value={vehicleForm.cargo_length} onChange={v => setVehicleForm(p => ({...p, cargo_length: v}))} placeholder='480"' />
                    <Field label="Width" value={vehicleForm.cargo_width} onChange={v => setVehicleForm(p => ({...p, cargo_width: v}))} placeholder='96"' />
                    <Field label="Height" value={vehicleForm.cargo_height} onChange={v => setVehicleForm(p => ({...p, cargo_height: v}))} placeholder='110"' />
                  </div>
                </div>

                {/* Vehicle Registration */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  <Field label="Registration Expiry" value={vehicleForm.registration_expiry} onChange={v => setVehicleForm(p => ({...p, registration_expiry: v}))} type="date" />
                </div>
                <UploadBox label="Vehicle Registration" required docType="vehicle_registration" hint="Upload current registration document." />

                {/* Vehicle Photos */}
                <div>
                  <Label>Vehicle Photos</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <UploadBox label="Front"      required docType="vehicle_photo_front" />
                    <UploadBox label="Rear"       required docType="vehicle_photo_rear" />
                    <UploadBox label="Cargo Area" required docType="vehicle_photo_cargo" />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Features</Label>
                  <div className="flex gap-4">
                    {([['liftgate', 'Liftgate'], ['climate_controlled', 'Climate Controlled'], ['enclosed', 'Enclosed']] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={vehicleForm[key]}
                          onChange={e => setVehicleForm(p => ({...p, [key]: e.target.checked}))}
                          className="w-4 h-4 rounded accent-[var(--color-teal)]" />
                        <span className="text-sm text-[var(--color-text)]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Primary */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={vehicleForm.is_primary}
                    onChange={e => setVehicleForm(p => ({...p, is_primary: e.target.checked}))}
                    className="w-4 h-4 rounded accent-[var(--color-teal)]" />
                  <span className="text-sm font-medium text-[var(--color-text)]">Set as primary vehicle</span>
                </label>

                <div className="flex gap-3 pt-2 border-t border-[var(--color-cream-dark)]">
                  <button
                    onClick={() => {
                      if (!vehicleForm.year || !vehicleForm.make || !vehicleForm.model) {
                        toast.error('Year, make and model are required');
                        return;
                      }
                      const { id, ...data } = vehicleForm;
                      addVehicleMutation.mutate(data as any);
                    }}
                    disabled={addVehicleMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--color-teal-light)] disabled:opacity-60"
                  >
                    {addVehicleMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                    Save Vehicle
                  </button>
                  <button
                    onClick={() => setShowAddVehicle(false)}
                    className="rounded-lg border border-[var(--color-cream-dark)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
