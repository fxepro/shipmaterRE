'use client';

import { CreateJobWizard } from '@/components/shipper/CreateJobWizard';

/** No-bid shipment against an existing carrier contract: Select contract → Build → Route → Billing → Send. */
export default function NewShipmentPage() {
  return <CreateJobWizard mode="shipment" />;
}
