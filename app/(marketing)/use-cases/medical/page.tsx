'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Stethoscope } from 'lucide-react';

export default function UseCaseMedicalPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={Stethoscope}
      title="Medical & Pharmaceutical"
      accent="Cold chain. Chain of custody. No exceptions."
      subtitle="Medical and pharmaceutical deliveries with cold chain enforcement, temperature logging, and exportable chain-of-custody records."
      points={[
        'Cold chain handling — only carriers with refrigerated capability are matched to temperature-sensitive jobs.',
        'Temperature logging at pickup, in transit, and at delivery — timestamped and stored.',
        'Lot number and batch reference fields for pharmaceutical traceability.',
        'Photo proof at pickup and delivery — condition documented, not assumed.',
        'GPS chain of custody record exportable for audit, compliance, or insurance.',
        'Approved vendor lists supported through the contracted carrier model.',
      ]}
      cta={{ label: 'Start shipping', href: '/register' }}
      secondaryCta={{ label: 'Compliance details', href: '/compliance' }}
    />
  );
}
