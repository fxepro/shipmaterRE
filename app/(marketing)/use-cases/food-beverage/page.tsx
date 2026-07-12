'use client';

import { MarketingSubPage } from '@/components/marketing/MarketingSubPage';
import { ShoppingCart } from 'lucide-react';

export default function UseCaseFoodPage() {
  return (
    <MarketingSubPage
      badge="Use Cases"
      icon={ShoppingCart}
      title="Food & Beverage Distribution"
      accent="Recurring routes. Temperature held. Every time."
      subtitle="Restaurant and distributor routes on contracted carriers with refrigerated handling, multi-stop batch dispatch, and temperature logging per stop."
      points={[
        'Contracted carriers for recurring routes — same provider, same standard, every run.',
        'Refrigerated handling enforcement — non-compliant carriers cannot bid on cold jobs.',
        'Batch dispatch for multi-stop delivery runs — single request, multiple destinations.',
        'Temperature logging per stop — every handoff recorded.',
        'Scheduled weekly or daily delivery automation — post once, run continuously.',
        'Delivery history and cost summaries per route for accounts and compliance.',
      ]}
      cta={{ label: 'Start shipping', href: '/register' }}
      secondaryCta={{ label: 'All industries', href: '/use-cases' }}
    />
  );
}
