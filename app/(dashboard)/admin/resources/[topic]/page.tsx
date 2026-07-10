'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { AdminResourcesTopic } from '@/components/shared/AdminResourcesPage';
import { getAdminTopic } from '@/lib/resources/admin-manual';

export default function AdminResourceTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = use(params);
  const topic = getAdminTopic(slug);
  if (!topic) notFound();
  return <AdminResourcesTopic topic={topic} />;
}
