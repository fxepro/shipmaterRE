/**
 * Customer-facing Profile guide (shipper Account → Profile).
 * No vendor/admin/dev setup content — that belongs in a separate internal manual.
 */

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface GuideMatrix {
  title: string;
  description?: string;
  columns: string[];
  rows: string[][];
}

export const SHIPPER_PROFILE_TABS: GuideSection[] = [
  {
    id: 'tab-profile',
    title: 'Profile',
    summary:
      'Your personal contact details and shipping defaults. Email and phone saved here are what verification uses on the Business tab—save before you verify.',
    bullets: [
      'Update legal name (first, middle, last, suffix)',
      'Set email and phone for your login contact',
      'Save a default ship-from address for new shipments',
      'Set default pickup contact name and phone',
      'Define an internal reference format (PO, job code, cost center)',
    ],
  },
  {
    id: 'tab-business',
    title: 'Business',
    summary:
      'Your company identity, addresses, and verification. Complete company details here, then verify email, phone, and business so partners can trust your account.',
    bullets: [
      'Enter legal business name, DBA, type, and industry',
      'Add tax ID type and number (for example EIN in the US)',
      'Set operating currency and company contact details',
      'Save registered and operating addresses',
      'Verify email, phone, and business (see validation matrix below)',
    ],
  },
  {
    id: 'tab-services',
    title: 'Services',
    summary:
      'Tell the platform what kinds of freight you ship so carrier matching and search stay relevant to your business.',
    bullets: [
      'Select all service types your company ships',
      'Save to improve carrier matching and filters',
    ],
  },
  {
    id: 'tab-compliance',
    title: 'Compliance',
    summary:
      'Optional documents some loads or partners may require. Upload files and track expiry dates so you are not caught with an expired certificate.',
    bullets: [
      'Upload Certificate of Insurance (COI) and set expiry',
      'Upload HIPAA BAA when healthcare-related shipments apply',
      'Upload HazMat shipper registration when you ship regulated hazmat',
      'Renew before expiry — you are alerted about 30 days out',
    ],
  },
  {
    id: 'tab-payment',
    title: 'Payment',
    summary:
      'Saved ways to pay for freight. Cards and bank accounts live here; invoice history lives under Financials → Payments.',
    bullets: [
      'Add a credit or debit card',
      'Add a bank account for ACH, or connect a bank securely',
      'Set a default payment method',
      'Remove methods you no longer use',
    ],
  },
  {
    id: 'tab-subscription',
    title: 'Subscription',
    summary:
      'Your plan and billing cycle for the workspace—what is included, when you are charged next, and options to change or cancel.',
    bullets: [
      'See your current plan and next billing date',
      'Compare monthly and yearly billing',
      'Review what the plan includes',
      'Cancel at the end of the current billing period if needed',
    ],
  },
  {
    id: 'tab-notifications',
    title: 'Notifications',
    summary:
      'Choose which shipment events reach you by email or text so you stay informed without unnecessary noise.',
    bullets: [
      'Toggle email alerts (carrier assigned, pickup, in transit, delivered, disputes, weekly summary, news)',
      'Toggle SMS alerts for the same operational events',
      'Save preferences so they apply going forward',
    ],
  },
  {
    id: 'tab-team',
    title: 'Team',
    summary:
      'Invite coworkers to your organization and manage roles so the right people can post jobs, pay, or view only.',
    bullets: [
      'Invite teammates by email',
      'Assign roles (owner, admin, dispatcher, viewer, and similar)',
      'Update or remove member access',
      'Track pending invitations',
    ],
  },
];

/** What must be true before each verification step succeeds. */
export const SHIPPER_VERIFICATION_MATRIX: GuideMatrix = {
  title: 'Verification checklist',
  description:
    'Complete these in order. Email and phone use the contact values saved on the Profile tab. Business review needs company details and a tax form on the Business tab.',
  columns: ['Step', 'Required first', 'What you do', 'When it is done'],
  rows: [
    [
      'Email',
      'Email saved on Profile tab',
      'Send verification email → open the link in your inbox (check spam)',
      'Badge shows Verified',
    ],
    [
      'Phone',
      'Phone saved on Profile tab',
      'Send code by text → enter the code on Business tab',
      'Badge shows Verified',
    ],
    [
      'Business',
      'Email verified; legal business name and tax ID saved; W-9 (or equivalent tax form) uploaded',
      'Submit for review on Business tab',
      'In review → Verified after platform approval',
    ],
  ],
};

/** Field / document requirements at a glance. */
export const SHIPPER_REQUIREMENTS_MATRIX: GuideMatrix = {
  title: 'What is required where',
  description:
    'Use this when something is blocked or a badge stays “Not verified.”',
  columns: ['Item', 'Where to enter it', 'Needed for'],
  rows: [
    ['Email address', 'Profile tab', 'Email verification; business submit'],
    ['Phone number', 'Profile tab', 'Phone verification'],
    ['Legal business name', 'Business tab', 'Business verification'],
    ['Tax ID (e.g. EIN)', 'Business tab', 'Business verification'],
    ['W-9 or equivalent tax form', 'Business tab (upload)', 'Business verification'],
    ['Articles of incorporation', 'Business tab (upload)', 'Optional support document'],
    ['Payment card or bank', 'Payment tab', 'Paying freight charges'],
    ['COI / HIPAA / HazMat docs', 'Compliance tab', 'Specific shipment types or partners'],
  ],
};
