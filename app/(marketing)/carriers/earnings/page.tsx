'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { DollarSign } from 'lucide-react';

export default function CarriersEarningsPage() {
  return (
    <MarketingSubPage
      badge="For Carriers"
      icon={DollarSign}
      title="Earnings & Payouts"
      accent="Bid, haul, get paid."
      subtitle="Matching job board, open-market bids, contracted direct offers, and fast escrow payouts — no factoring, no invoice chasing."
      points={[
        'Matching job board — only see loads that fit your equipment, service types, and operating region.',
        'Bid on open market loads or accept contracted direct offers from shipper networks you\'re approved on.',
        'Escrow payout on delivery confirmation — upload your POD and funds release to your connected bank account.',
        'Average payout within 48 hours of confirmed delivery — no 30–60 day broker payment cycles.',
        'Build your rating — every completed job adds to your profile visibility and shipper trust.',
        'Earnings dashboard — active jobs, pending escrow, and lifetime earnings in one view.',
      ]}
      cta={{ label: 'Create carrier profile', href: '/register?role=carrier' }}
      secondaryCta={{ label: 'Carrier overview', href: '/carriers' }}
    />
  );
}
