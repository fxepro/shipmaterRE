'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Truck } from 'lucide-react';

export default function UseCaseFreightPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={Truck}
      title="Freight & Logistics"
      accent="Open market. Contracted lanes. One platform."
      subtitle="Whether you run a one-off load or manage contracted lanes with regular carriers, Shipmater handles both models on a single platform."
      points={[
        'Open market bidding — post a job, receive bids from verified carriers, compare and assign.',
        'Contracted dispatch — assign directly to preferred carriers under agreed rates.',
        'Real-road route planning with live ETA updates across every active job.',
        'Live GPS tracking from pickup through every stop to final delivery.',
        'Cost breakdowns, fuel surcharges, and detention terms visible before you commit.',
        'Construction and heavy haul — flatbed, lowboy, and oversize loads with equipment-matched carriers.',
      ]}
      cta={{ label: 'Start shipping', href: '/register' }}
      secondaryCta={{ label: 'All industries', href: '/use-cases' }}
    />
  );
}
