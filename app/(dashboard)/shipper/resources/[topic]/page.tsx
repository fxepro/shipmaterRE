'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { ResourcesTopicDetail } from '@/components/shared/ResourcesPage';
import { getTopic } from '@/lib/resources/manual';

export default function ShipperResourceTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = use(params);
  const topic = getTopic('shipper', slug);
  if (!topic) notFound();
  return <ResourcesTopicDetail audience="shipper" topic={topic} />;
}
