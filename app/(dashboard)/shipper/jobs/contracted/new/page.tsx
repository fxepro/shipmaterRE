'use client';

import { CreateJobWizard } from '@/components/shipper/CreateJobWizard';

/** Create Job — open market (bidding) or contracted posting. */
export default function CreateJobPage() {
  return <CreateJobWizard mode="job" />;
}
