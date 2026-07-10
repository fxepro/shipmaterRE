'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { Package } from 'lucide-react';

export default function HowItWorksPostPage() {
  return (
    <MarketingSubPage
      badge="How It Works"
      icon={Package}
      title="Post & Match"
      accent="Under two minutes to a live quote."
      subtitle="Describe what you need moved, where it starts, and where it goes — vetted providers respond with clear, itemised quotes."
      points={[
        'Item description, dimensions, weight, and special handling requirements captured upfront.',
        'Pickup and delivery addresses with date windows and access instructions.',
        'Only pre-screened, insured providers can see and respond to your request.',
        'Each quote is itemised — base rate, fuel surcharge, and fees shown before you commit.',
        'Provider profiles show credentials, insurance, ratings, and relevant experience.',
        'No obligation to accept — compare quotes and assign when you\'re ready.',
      ]}
      cta={{ label: 'Post your first shipment', href: '/register' }}
      secondaryCta={{ label: 'Full walkthrough', href: '/how-it-works' }}
    />
  );
}
