'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { MapPin } from 'lucide-react';

export default function HowItWorksTrackPage() {
  return (
    <MarketingSubPage
      badge="How It Works"
      icon={MapPin}
      title="Track Live"
      accent="Every mile. Every ping. On record."
      subtitle="GPS tracking from the moment of pickup through confirmed delivery — with alerts, shareable links, and a permanent audit trail."
      points={[
        'Real-time map showing your delivery\'s current position and route.',
        'Automatic alerts at pickup, en route, nearby, and delivered milestones.',
        'Delay detection — you\'re notified the moment the ETA changes.',
        'Shareable tracking link so receivers can follow without an account.',
        'Photo and signature evidence at pickup and delivery stops.',
        'Full delivery log stored permanently — every ping, status change, and document.',
      ]}
      cta={{ label: 'See shipper tracking', href: '/shippers/tracking' }}
      secondaryCta={{ label: 'Full walkthrough', href: '/how-it-works' }}
    />
  );
}
