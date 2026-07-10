'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Lock } from 'lucide-react';

export default function HowItWorksPayPage() {
  return (
    <MarketingSubPage
      badge="How It Works"
      icon={Lock}
      title="Pay Securely"
      accent="Escrow until delivery is confirmed."
      subtitle="Payment is held when you assign a provider and released only when delivery is confirmed — neither party can skip the process."
      points={[
        'Funds placed in escrow the moment you confirm your provider.',
        'Payment is never released until delivery is confirmed by the shipper.',
        'Dispute resolution built in — evidence, GPS logs, and documents reviewed by the platform.',
        'Carriers receive payout to their connected bank account after POD confirmation.',
        'Transparent cost breakdown — freight, surcharges, and platform fees visible upfront.',
        'Invoice and settlement documents generated automatically per completed job.',
      ]}
      cta={{ label: 'Create free account', href: '/register' }}
      secondaryCta={{ label: 'Carrier payouts', href: '/carriers/earnings' }}
    />
  );
}
