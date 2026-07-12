'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { HardHat } from 'lucide-react';

export default function UseCaseConstructionPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={HardHat}
      title="Construction Equipment"
      accent="Heavy, oversized, one-off — open market handles it."
      subtitle="Skid steers, excavators, flatbed and oversize machinery with equipment-matched carriers, weight and dimension capture, and photo documentation."
      points={[
        'Open market model — one-off heavy moves get competitive bids from qualified carriers.',
        'Flatbed, lowboy, oversize, and heavy haul handling requirements specifiable.',
        'Weight, dimensions, and permit requirements captured upfront — no surprises.',
        'Carrier matching by equipment type — only appropriate rigs see your job.',
        'Photo documentation at pickup and delivery — condition and load security recorded.',
        'Oversize load routing support — carriers confirm route compliance before accepting.',
      ]}
      cta={{ label: 'Post a heavy move', href: '/register' }}
      secondaryCta={{ label: 'All industries', href: '/use-cases' }}
    />
  );
}
