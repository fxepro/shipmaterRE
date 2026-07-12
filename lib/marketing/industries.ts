import {
  Stethoscope, Car, ShoppingCart, HardHat,
  Store, Factory, Landmark, Frame,
  type LucideIcon,
} from 'lucide-react';

export interface IndustryCapability {
  title: string;
  desc: string;
}

export interface IndustryScenarioStep {
  time: string;
  text: string;
}

export interface IndustryPage {
  slug: string;
  title: string;
  accent: string;
  subtitle: string;
  /** Drop your photo at public/industries/{slug}.jpg */
  image: string;
  imageAlt: string;
  challengeTitle: string;
  challenge: string;
  approachTitle: string;
  approach: string;
  capabilities: IndustryCapability[];
  scenarioTitle: string;
  scenarioTag: string;
  scenario: IndustryScenarioStep[];
  outcomes: string[];
  icon: LucideIcon;
}

/** The eight Industries — independent pages under /industries/[slug]. */
export const INDUSTRIES: IndustryPage[] = [
  {
    slug: 'healthcare-pharma',
    icon: Stethoscope,
    title: 'Healthcare & Pharma',
    accent: 'Cold chain. Chain of custody. No exceptions.',
    subtitle:
      'Lab samples, medications, and medical equipment move under temperature control, photo proof, and an exportable audit trail — not a standard courier workflow.',
    image: '/industries/healthcare-pharma.jpg',
    imageAlt: 'Medical courier loading temperature-controlled specimens',
    challengeTitle: 'Medical freight fails on gaps, not miles',
    challenge:
      'A missed temperature window, an undocumented handoff, or an unvetted courier can invalidate a specimen run or expose a compliance gap. Healthcare and pharma logistics need carriers who are matched to cold-chain capability, jobs that capture lot and batch data, and a record that survives an audit — not a status emoji in a text thread.',
    approachTitle: 'How Shipmater runs medical moves',
    approach:
      'Post with handling requirements that filter the field. Contracted pools keep approved vendors only. Every stop can log temperature context, photos, and GPS. When the run closes, you export a chain-of-custody record tied to a verified carrier — not an anonymous phone number.',
    capabilities: [
      {
        title: 'Cold-chain matching',
        desc: 'Jobs that require refrigerated handling only surface to carriers with the right equipment profile. Non-compliant bidders stay out of the pool.',
      },
      {
        title: 'Lot and batch fields',
        desc: 'Capture pharmaceutical identifiers on the job so traceability lives with the shipment record, not in a side spreadsheet.',
      },
      {
        title: 'Photo + GPS custody',
        desc: 'Pickup and delivery evidence with timestamps and location creates an auditable handoff history for compliance and insurance.',
      },
      {
        title: 'Approved vendor pools',
        desc: 'Contracted carrier lists keep sensitive lanes off the open market when your compliance policy requires a closed network.',
      },
      {
        title: 'Exportable audit trail',
        desc: 'Shipment history, evidence, and status changes stay attached to the job for regulatory review and internal QA.',
      },
      {
        title: 'Time-critical dispatch',
        desc: 'Post with arrival windows and live tracking so labs, clinics, and pharmacies see the same ETA as your ops team.',
      },
    ],
    scenarioTitle: 'A biotech lab ships temperature-sensitive samples before clinic open',
    scenarioTag: 'Cold chain held · Full custody record exported',
    scenario: [
      { time: '4:45am', text: 'Job posted — cold chain required, arrival by 7:00am' },
      { time: '4:53am', text: 'Contracted refrigerated carrier confirmed' },
      { time: '5:20am', text: 'Pickup photos + temp logged · GPS custody starts' },
      { time: '6:48am', text: 'En route · live ETA shared with receiving lab' },
      { time: '6:59am', text: 'Delivered · POD + lot verified · record closed' },
    ],
    outcomes: [
      'Only refrigerated-capable carriers see the job',
      'Temperature and photo evidence at both ends',
      'GPS chain of custody exportable for audit',
      'Approved vendors via contracted pools',
    ],
  },
  {
    slug: 'auto-dealerships',
    icon: Car,
    title: 'Auto & Dealerships',
    accent: 'Every scratch documented before it moves.',
    subtitle:
      'Dealer trades, fleet repositioning, and private-party moves with VIN capture, condition photos, and evidence that settles disputes before they start.',
    image: '/industries/auto-dealerships.jpg',
    imageAlt: 'Vehicle loaded onto an auto transporter',
    challengeTitle: 'Vehicle claims are won or lost on condition records',
    challenge:
      'Auto transport lives on before-and-after proof. Without VIN logging, multi-angle photos, and a timestamped delivery record, a scratched bumper becomes a he-said dispute. Dealers and fleets also need both models: open-market bids for one-offs and contracted capacity for steady lane volume.',
    approachTitle: 'How Shipmater runs auto moves',
    approach:
      'Every auto job can carry VIN and condition fields. Photo capture at pickup and delivery builds an irrefutable record. Filter carriers by auto experience, share live tracking with the buyer or receiving dealer, and keep contracted partners ready for recurring fleet work.',
    capabilities: [
      {
        title: 'VIN and condition fields',
        desc: 'Log identity and pre-move condition on the job so the record travels with the vehicle, not in a separate form.',
      },
      {
        title: 'Mandatory photo evidence',
        desc: 'Pickup and delivery photos — exterior angles and interior — create a permanent before-and-after file.',
      },
      {
        title: 'Open market + contracted',
        desc: 'Bid out one-off private moves or assign directly to dealership and fleet partners under standing rates.',
      },
      {
        title: 'Auto-experienced carriers',
        desc: 'Ratings and profile data help you prefer operators who actually haul vehicles, not general freight only.',
      },
      {
        title: 'Buyer-visible tracking',
        desc: 'Share a live tracking link so the receiving party watches the same map your desk sees.',
      },
      {
        title: 'Evidence-based disputes',
        desc: 'When condition is contested, the timestamped photo set is the source of truth — not memory.',
      },
    ],
    scenarioTitle: 'A dealer ships a purchased vehicle to a buyer two states away',
    scenarioTag: 'VIN logged · Condition photos · Zero dispute',
    scenario: [
      { time: '9:00am', text: 'Job posted — VIN logged, condition noted' },
      { time: '9:18am', text: 'Auto-rated carrier confirmed and insured' },
      { time: '10:05am', text: 'Pickup — multi-angle photos · VIN verified' },
      { time: '2:30pm', text: 'En route — live tracking shared with buyer' },
      { time: '6:14pm', text: 'Delivered — delivery photos · buyer confirms' },
    ],
    outcomes: [
      'VIN and condition captured on every move',
      'Photo evidence at pickup and delivery',
      'Open market or contracted dealer lanes',
      'Shareable live tracking for buyers',
    ],
  },
  {
    slug: 'food-beverage',
    icon: ShoppingCart,
    title: 'Food & Beverage',
    accent: 'Recurring routes. Temperature held. Every time.',
    subtitle:
      'Restaurant groups and distributors running the same refrigerated lanes week after week — with multi-stop dispatch and a log at every handoff.',
    image: '/industries/food-beverage.jpg',
    imageAlt: 'Refrigerated delivery at a food service dock',
    challengeTitle: 'Food logistics is a calendar problem as much as a truck problem',
    challenge:
      'Miss a temperature window and product is waste. Miss a recurring stop and a kitchen is short. Food and beverage distribution needs contracted reliability, refrigerated enforcement, and multi-stop batching — not a new spot auction every Monday morning.',
    approachTitle: 'How Shipmater runs food & beverage',
    approach:
      'Stand up contracted carriers for your weekly lanes. Require refrigerated handling so the wrong equipment never bids. Batch multi-stop runs into one job, log temperature context per stop, and keep route cost history for accounting and compliance.',
    capabilities: [
      {
        title: 'Contracted recurring lanes',
        desc: 'Same carrier, same standard, predictable rates — without renegotiating every week.',
      },
      {
        title: 'Refrigerated enforcement',
        desc: 'Cold jobs only match carriers with reefer capability. Ambient equipment stays filtered out.',
      },
      {
        title: 'Multi-stop batch dispatch',
        desc: 'One request, multiple destinations — restaurant groups and distributors run the full loop in a single job.',
      },
      {
        title: 'Per-stop confirmation',
        desc: 'Delivery confirmation and evidence at each location so nothing “falls off” the route silently.',
      },
      {
        title: 'Temperature-aware logging',
        desc: 'Capture cold-chain context alongside GPS and photos for QA and supplier disputes.',
      },
      {
        title: 'Route cost history',
        desc: 'Summaries per lane for accounts payable, franchise reporting, and continuous improvement.',
      },
    ],
    scenarioTitle: 'A restaurant group runs its Monday multi-stop supply loop',
    scenarioTag: 'Recurring · 3 stops · Cold chain held',
    scenario: [
      { time: 'Mon 4:50am', text: 'Recurring job active — contracted reefer carrier pre-assigned' },
      { time: '5:00am', text: 'Carrier confirms · refrigerated unit logged' },
      { time: '5:45am', text: 'DC pickup · temp noted · batch manifest started' },
      { time: '7:30am', text: 'Stop 1 delivered · signed · temp held' },
      { time: '9:10am', text: 'Final stop complete · route log closed' },
    ],
    outcomes: [
      'Contracted carriers for weekly routes',
      'Refrigerated matching enforced',
      'Multi-stop batch in one job',
      'Per-stop confirmation and history',
    ],
  },
  {
    slug: 'construction-equipment',
    icon: HardHat,
    title: 'Construction & Equipment',
    accent: 'Heavy, oversized, one-off — open market handles it.',
    subtitle:
      'Skid steers, excavators, and oversize machinery matched to flatbed and lowboy capacity — with dimensions, permits, and photo proof up front.',
    image: '/industries/construction-equipment.jpg',
    imageAlt: 'Heavy equipment secured on a flatbed trailer',
    challengeTitle: 'Heavy haul is irregular — and unforgiving of bad matches',
    challenge:
      'Construction moves rarely fit a standing schedule. Wrong trailer type, missing dimensions, or unclear permit needs waste days. You need an open market that only shows qualified heavy-haul capacity, with weight and equipment requirements captured before anyone quotes.',
    approachTitle: 'How Shipmater runs equipment moves',
    approach:
      'Post weight, dimensions, and handling (flatbed, lowboy, oversize). Only equipment-matched carriers see the job. Capture photos at pickup and delivery for load security and condition, and confirm route readiness before the truck rolls.',
    capabilities: [
      {
        title: 'Open-market heavy haul',
        desc: 'One-off site moves get competitive bids from carriers who actually run flatbed and lowboy equipment.',
      },
      {
        title: 'Equipment-type matching',
        desc: 'Specify flatbed, lowboy, or oversize so ambient vans never clog your bid list.',
      },
      {
        title: 'Dims and weight upfront',
        desc: 'Capture the numbers carriers need to quote accurately — before the phone tag starts.',
      },
      {
        title: 'Permit and special notes',
        desc: 'Surface oversize and route constraints on the tender so surprises show up before accept.',
      },
      {
        title: 'Load-secure photo proof',
        desc: 'Pickup and delivery photos document condition and how the machine was secured.',
      },
      {
        title: 'Same-day site delivery',
        desc: 'Live tracking keeps the job site informed while the machine is en route.',
      },
    ],
    scenarioTitle: 'A contractor moves a skid steer 180 miles to an active site',
    scenarioTag: 'Flatbed matched · Competitive bids · On site same day',
    scenario: [
      { time: '7:00am', text: 'Job posted — 8,200 lbs, flatbed required' },
      { time: '7:22am', text: 'Qualified flatbed bids only' },
      { time: '7:35am', text: 'Carrier assigned · equipment verified' },
      { time: '9:00am', text: 'Pickup · machine secured · photos taken' },
      { time: '1:45pm', text: 'Delivered to site · condition confirmed' },
    ],
    outcomes: [
      'Open market for irregular heavy moves',
      'Flatbed / lowboy / oversize matching',
      'Weight and dimensions on every tender',
      'Photo documentation at both ends',
    ],
  },
  {
    slug: 'retail-ecommerce',
    icon: Store,
    title: 'Retail & E-Commerce',
    accent: 'From DC to doorstep — tracked every mile.',
    subtitle:
      'Store replenishment, returns, and high-touch last-mile with live GPS, proof of delivery, and escrow that releases when the drop is confirmed.',
    image: '/industries/retail-ecommerce.jpg',
    imageAlt: 'Retail distribution and last-mile parcel staging',
    challengeTitle: 'Retail freight spans the warehouse and the front door',
    challenge:
      'DC-to-store replenishment, customer returns, and white-glove last-mile are different jobs with the same requirement: visibility and proof. Chargebacks and “where is my order” tickets explode when tracking and POD are afterthoughts.',
    approachTitle: 'How Shipmater runs retail moves',
    approach:
      'Batch multi-stop store runs, share live tracking with ops or the customer, and require POD with photos and signature. Use contracted lanes for standing replenishment and open market when volume spikes. Escrow holds payment until delivery is confirmed.',
    capabilities: [
      {
        title: 'DC and store multi-stop',
        desc: 'Replenish a region in one job — every store stop confirmed individually.',
      },
      {
        title: 'Last-mile and white glove',
        desc: 'High-value retail and furniture-style drops with handling requirements and photo POD.',
      },
      {
        title: 'Shared live tracking',
        desc: 'Give stores, customers, or franchise ops the same map your desk uses.',
      },
      {
        title: 'Proof at every drop',
        desc: 'Photos and signatures close the loop for chargebacks and customer support.',
      },
      {
        title: 'Lane flexibility',
        desc: 'Contracted capacity for standing routes; open market when peak season hits.',
      },
      {
        title: 'Escrow on confirmation',
        desc: 'Funds release when delivery is confirmed — not when the truck leaves the yard.',
      },
    ],
    scenarioTitle: 'A regional retailer replenishes eight stores before weekend open',
    scenarioTag: 'Multi-stop · Live tracking · POD at every door',
    scenario: [
      { time: 'Thu 6:00pm', text: 'Multi-stop replenishment job posted from DC' },
      { time: 'Thu 7:10pm', text: 'Contracted carrier assigned · manifest locked' },
      { time: 'Fri 5:30am', text: 'DC loaded · GPS live for store ops' },
      { time: 'Fri 11:40am', text: 'Stops 1–5 delivered · photo POD each' },
      { time: 'Fri 3:20pm', text: 'Final store complete · escrow release queued' },
    ],
    outcomes: [
      'Multi-stop store and DC runs',
      'Live GPS for ops and customers',
      'POD with photos and signature',
      'Escrow release on confirmation',
    ],
  },
  {
    slug: 'manufacturing',
    icon: Factory,
    title: 'Manufacturing',
    accent: 'Parts, WIP, and finished goods on one platform.',
    subtitle:
      'Inbound components and outbound finished goods with contracted plant lanes, spot overflow when capacity spikes, and a full cost trail per job.',
    image: '/industries/manufacturing.jpg',
    imageAlt: 'Manufacturing dock loading industrial freight',
    challengeTitle: 'Plants need predictability — and a valve for chaos',
    challenge:
      'Standing lanes keep the line fed. Then a supplier delay, a rush order, or a finished-goods spike needs overflow capacity overnight. Manufacturing logistics needs both contracted reliability and an open market that can absorb the surge without losing dock visibility.',
    approachTitle: 'How Shipmater runs manufacturing freight',
    approach:
      'Lock preferred carriers on contracted lanes for plant-to-plant and inbound supply. Flip to open market when volume spikes. Capture weight, dims, and handling on every tender. Track live into receiving so docks schedule against reality, not hope.',
    capabilities: [
      {
        title: 'Contracted plant lanes',
        desc: 'Standing rates and preferred carriers for the runs that keep production on schedule.',
      },
      {
        title: 'Spot overflow',
        desc: 'Open-market bidding when capacity or demand spikes beyond contracted cover.',
      },
      {
        title: 'Full tender detail',
        desc: 'Weight, dimensions, and handling requirements so quotes reflect the real load.',
      },
      {
        title: 'Multi-stop and cross-dock',
        desc: 'Support sequenced plant drops and intermediate handoffs in one job structure.',
      },
      {
        title: 'Dock-aware tracking',
        desc: 'Live ETA for receiving teams scheduling labor and door assignments.',
      },
      {
        title: 'Job-level cost trail',
        desc: 'Invoices and breakdowns tied to each shipment for plant accounting and landed cost.',
      },
    ],
    scenarioTitle: 'A plant covers a rush finished-goods push after a line changeover',
    scenarioTag: 'Contracted base · Spot overflow · Dock ETA live',
    scenario: [
      { time: 'Day 1', text: 'Standing contracted lane covers routine outbound' },
      { time: '2:10pm', text: 'Rush volume posted to open market with dims + weight' },
      { time: '2:40pm', text: 'Overflow carrier assigned · rate confirmed' },
      { time: '5:15pm', text: 'Loaded · receiving plant watching live ETA' },
      { time: 'Next AM', text: 'Delivered · invoice + cost breakdown on the job' },
    ],
    outcomes: [
      'Contracted lanes for predictable volume',
      'Open market when capacity spikes',
      'Dims and handling on every tender',
      'Live ETA into plant receiving',
    ],
  },
  {
    slug: 'government',
    icon: Landmark,
    title: 'Government & Public Sector',
    accent: 'Verified carriers. Full audit trail. No shortcuts.',
    subtitle:
      'Agency and municipal freight with background-checked carriers, chain of custody, role-based access, and records you can export for oversight.',
    image: '/industries/government.jpg',
    imageAlt: 'Secure public-sector freight at a civic loading dock',
    challengeTitle: 'Public freight is judged on process, not just arrival',
    challenge:
      'Government and public-sector moves must survive FOIA, inspector general review, and internal audit. Anonymous carriers, missing custody logs, and informal payment trails create exposure. You need verified operators, closed preferred pools when required, and an exportable record of every handoff and payment.',
    approachTitle: 'How Shipmater runs public-sector moves',
    approach:
      'Only verified carriers — identity, authority, screening, insurance. Restrict sensitive work to contracted approved vendors. Capture photos, GPS, and signatures. Give agencies role-based org access and escrow release on confirmed delivery with a payment history you can export.',
    capabilities: [
      {
        title: 'Verified carrier only',
        desc: 'Background-checked, credential-verified operators — no anonymous loadboard pickup.',
      },
      {
        title: 'Chain of custody',
        desc: 'Photos, GPS, timestamps, and signatures build a defensible custody record.',
      },
      {
        title: 'Approved vendor pools',
        desc: 'Contracted lists keep work inside pre-cleared carrier networks when policy requires it.',
      },
      {
        title: 'Role-based org access',
        desc: 'Departments and agencies manage users and permissions without sharing one login.',
      },
      {
        title: 'Exportable records',
        desc: 'Shipment and payment history available for oversight, audit, and retention policy.',
      },
      {
        title: 'Escrow on confirmation',
        desc: 'Funds release when delivery is confirmed — clean settlement trail for finance.',
      },
    ],
    scenarioTitle: 'An agency relocates sealed materials between facilities',
    scenarioTag: 'Verified carrier · Custody logged · Export ready',
    scenario: [
      { time: 'Day 0', text: 'Job restricted to contracted approved carrier pool' },
      { time: '08:00', text: 'Verified carrier assigned · credentials on profile' },
      { time: '09:15', text: 'Pickup — sealed crates photographed · GPS starts' },
      { time: '11:40', text: 'En route — agency ops watching live tracking' },
      { time: '13:05', text: 'Delivered — signature POD · escrow + export archive' },
    ],
    outcomes: [
      'Verified carriers only',
      'Full photo + GPS custody trail',
      'Approved vendor pools when required',
      'Exportable shipment and payment records',
    ],
  },
  {
    slug: 'arts-specialty',
    icon: Frame,
    title: 'Arts & Specialty',
    accent: 'Irreplaceable handled by the qualified few.',
    subtitle:
      'Fine art, antiques, instruments, and estate contents with declared value, white-glove handling, and condition photography at every handoff.',
    image: '/industries/arts-specialty.jpg',
    imageAlt: 'Specialty art crate prepared for white-glove transport',
    challengeTitle: 'Specialty freight is about who never sees the job',
    challenge:
      'Irreplaceable items cannot be “generally insured freight.” The wrong handler should never receive the tender. You need declared value visible before bid, specialist credentials, climate or white-glove requirements, and a photographic condition record that outlasts the move.',
    approachTitle: 'How Shipmater runs specialty moves',
    approach:
      'Post declared value and handling requirements so only qualified carriers engage. Filter on certifications and ratings. Capture condition photos at pickup and delivery. Coordinate multi-item estate and multi-destination specialty moves in one structured request.',
    capabilities: [
      {
        title: 'Declared value on tender',
        desc: 'Carriers see coverage expectations before they bid — no bait-and-switch on risk.',
      },
      {
        title: 'Specialist filtering',
        desc: 'Certification and experience filters keep general freight operators off high-value jobs.',
      },
      {
        title: 'White-glove handling',
        desc: 'Climate control, white-glove, and fragile handling as first-class job requirements.',
      },
      {
        title: 'Condition photography',
        desc: 'Before-and-after photo sets stored with the shipment for insurers and estates.',
      },
      {
        title: 'Insurance verification',
        desc: 'Confirm coverage posture before assignment when the item’s value demands it.',
      },
      {
        title: 'Estate multi-destination',
        desc: 'Coordinate multi-item, multi-stop specialty moves without splintering into email chaos.',
      },
    ],
    scenarioTitle: 'An estate executor ships antique furniture to auction',
    scenarioTag: 'Declared value · Specialist certified · Condition verified',
    scenario: [
      { time: 'Day 1', text: 'Request posted — declared value, white-glove required' },
      { time: 'Day 1', text: 'Specialist carrier confirmed · insured to value' },
      { time: '8:30am', text: 'Pickup — condition photos · pieces wrapped and logged' },
      { time: '1:15pm', text: 'En route — live tracking for executor' },
      { time: '3:40pm', text: 'Delivered to auction — condition confirmed · record closed' },
    ],
    outcomes: [
      'Declared value visible before bid',
      'Specialist and white-glove filtering',
      'Photographic condition at both ends',
      'Multi-item estate coordination',
    ],
  },
];

export function getIndustry(slug: string): IndustryPage | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
