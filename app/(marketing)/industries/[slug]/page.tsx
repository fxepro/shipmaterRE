'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { IndustryDetailView } from '@/components/marketing/IndustryDetailView';
import { getIndustry } from '@/lib/marketing/industries';

export default function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const industry = getIndustry(slug);
  if (!industry) notFound();

  return <IndustryDetailView industry={industry} />;
}
