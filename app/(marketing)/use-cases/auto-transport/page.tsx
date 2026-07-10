'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Car } from 'lucide-react';

export default function UseCaseAutoPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={Car}
      title="Auto Transport"
      accent="Every scratch documented before it moves."
      subtitle="Vehicle transport with VIN capture, condition reports, and photo evidence at pickup and delivery — for dealers, fleets, and private sellers."
      points={[
        'VIN capture and vehicle condition report fields built into every auto delivery.',
        'Photo capture enforced at pickup and delivery — front, rear, sides, and interior.',
        'Open market model for one-off moves — competitive bids from transport-rated carriers.',
        'Contracted model for dealers and fleet operators needing regular, consistent transport.',
        'Evidence-based dispute resolution — condition record is timestamped and tamper-proof.',
        'Carrier ratings filtered by auto transport experience — not just general ratings.',
      ]}
      cta={{ label: 'Post a vehicle move', href: '/register' }}
      secondaryCta={{ label: 'All industries', href: '/use-cases' }}
    />
  );
}
