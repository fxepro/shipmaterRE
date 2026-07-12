'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Frame } from 'lucide-react';

export default function UseCaseArtPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={Frame}
      title="Art, Antiques & Estate Moves"
      accent="Irreplaceable handled by the qualified few."
      subtitle="Fine art, antiques, and estate contents with declared value, specialist carriers, and photographic condition records at every handoff."
      points={[
        'Declared value field — carriers see coverage requirements before bidding.',
        'Filtering by certification and specialist handling credentials.',
        'White-glove and climate-controlled handling requirements supported.',
        'Photographic condition record at pickup and delivery — stored permanently.',
        'Insurance verification at the item level before a carrier is assigned.',
        'Estate executor support — multi-item, multi-destination moves in one request.',
      ]}
      cta={{ label: 'Start shipping', href: '/register' }}
      secondaryCta={{ label: 'All industries', href: '/use-cases' }}
    />
  );
}
