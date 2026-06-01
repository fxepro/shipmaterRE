# ShipMaster — Navigation & Feature Specification

## Overview

Three separate user experiences. One shared backend. All three roles see the
same live Mapbox map when a shipment is active — the map component is reused
across dispatcher portal, carrier mobile app, and receiver portal.

---

## User Roles

| Role | Interface | Created by |
|---|---|---|
| Dispatcher (Shipper) | Web portal — Next.js | Self-registration |
| Carrier | Mobile app — React Native (Expo) | Self-registration, verified by admin |
| Receiver | Web portal — Next.js | Auto-invited when contract is signed |

---

## 1. Dispatcher Web Portal

Full sidebar navigation. Dispatcher manages contracts, creates shipments,
monitors live tracking, and reviews financials.

---

### Overview

#### Dashboard
- Count of active, in-transit, and delivered shipments today
- Mini live map showing all in-transit carriers as moving dots
- Recent activity feed: shipment status changes, new carrier assignments,
  contract expirations approaching
- Quick action buttons: New shipment, View live map

---

### Shipments

#### My shipments
- Master list of all shipments
- Three tabs:
  - **Contracted** — shipments dispatched against a signed contract. Shows:
    carrier name, contract reference, item description, route
    (city → city), status pill, estimated cost, actual cost (post-delivery)
  - **Open jobs** — Phase 2 only. Shipments posted to the open marketplace
    with bidding. Tab visible but marked "Coming soon" in Phase 1.
  - **All** — combined view, all statuses, sortable by date / status / carrier
- Status pills: Draft · Assigned · In transit · Delivered · Disputed
- Click any row → shipment detail page with live map if in transit

#### New shipment
- Contracted shipment creation form (Phase 1 only)
- Step 1 — Select contract
  - Dropdown of active contracts only (expired and draft contracts excluded)
  - Selecting a contract auto-fills: carrier name, carrier contact, rate
    structure, item categories covered, payment terms
  - Warning shown if selected contract expires within 7 days
- Step 2 — Shipment details
  - Item description (text)
  - Item category (constrained to categories listed on the selected contract)
  - Weight (lbs)
  - Handling requirements (pre-filled from contract, editable)
  - Special instructions (text)
  - Photo upload (optional, up to 5)
- Step 3 — Route
  - Pickup address (Google Places autocomplete)
  - Pickup contact name and phone (pre-filled from contract if set)
  - Pickup date and window (date picker + time range)
  - Delivery address (Google Places autocomplete)
  - Delivery contact name and phone (pre-filled from receiver on contract)
  - Delivery window (date picker + time range)
  - On address entry: Google Distance Matrix API calculates driving miles
    and estimated drive time automatically
- Step 4 — Cost estimate
  - Displays calculated route distance in miles
  - Applies contract rate structure:
    - Per-mile rate × distance
    - Plus flat fee per shipment (if set on contract)
    - Plus fuel surcharge % (if set on contract)
  - Shows line-by-line breakdown: mileage cost / flat fee / surcharge / total
  - Dispatcher confirms estimated cost before proceeding
  - Note: actual cost locked in post-delivery based on GPS-recorded mileage
- Step 5 — Review and confirm
  - Summary of all details
  - Confirm button creates the shipment record, sets status to Assigned,
    notifies carrier via push notification and SMS

---

### Tracking

#### Live map
- Full-width Mapbox map
- All in-transit shipments shown as labelled carrier dots
- Dots update in real time via Laravel Reverb WebSocket (every 30 seconds)
- Click any dot → slide-up panel showing:
  - Carrier name and contact
  - Item description and shipment reference
  - Route line from pickup to delivery
  - Current speed
  - Live ETA
  - Link to full shipment detail
- Filter bar: All carriers / By carrier / By status

#### Route planner
- Standalone tool. Not tied to an active shipment.
- Enter pickup address and delivery address (Google Places autocomplete)
- Google Distance Matrix API returns: driving distance (miles), estimated
  drive time
- Apply any active contract rate to calculate estimated shipment cost:
  - Select contract from dropdown
  - Cost breakdown shown: mileage × rate / flat fee / surcharge / total
- Use case: dispatcher quotes a cost to a client before creating a shipment
- "Create shipment with this route" button pre-fills Step 3 of New shipment

---

### Contracts

#### Agreements
- List of all carrier contracts
- Columns: carrier name, receiver name, rate structure summary, effective
  date, expiry date, status
- Status values:
  - **Draft** — created, not yet signed by both parties
  - **Pending signature** — sent to carrier or receiver, awaiting signature
  - **Active** — fully signed, within effective and expiry dates
  - **Expiring** — active but expiring within 30 days (amber highlight)
  - **Expired** — past expiry date, cannot be used for new shipments
- Click any row → contract detail: full terms, signatures, shipment history
  against this contract, renewal button
- Expiry alerts: system sends email to dispatcher at 30 days and 7 days
  before expiry. One-click renewal generates a new draft pre-filled with
  existing terms.

#### New agreement
- Contract creation form
- Section 1 — Parties
  - Shipper / dispatcher org (pre-filled from account)
  - Carrier: select from My carriers list (verified carriers only)
  - Receiver: name, email, phone
    - On contract signing, system auto-sends receiver an invite email to
      create their ShipMaster account
    - Receiver does not exist as a user until they accept the invite
    - Receiver account is read-only: sees deliveries assigned to them only
- Section 2 — Rate structure
  - Rate type: Per mile / Flat per shipment / Hybrid (flat + per mile)
  - Rate per mile (USD, shown if rate type is per mile or hybrid)
  - Flat fee per shipment (USD, shown if rate type is flat or hybrid)
  - Fuel surcharge % (optional, applied on top of calculated cost)
  - Payment terms: Immediate / Net-7 / Net-14 / Net-30
- Section 3 — Scope
  - Item categories covered (multi-select from standard list)
  - Handling requirements included (multi-select)
  - Maximum weight per shipment (lbs, optional cap)
  - Service area: state(s) or nationwide (optional)
- Section 4 — Dates
  - Effective date
  - Expiry date
  - Auto-renewal: yes / no (if yes, renews 30 days before expiry with
    same terms unless cancelled)
- Section 5 — Review and send for signature
  - System generates a formatted PDF preview of the contract
  - Dispatcher signs first (e-signature, typed name + timestamp)
  - Contract emailed to carrier for signature
  - Once carrier signs, contract status moves to Active
  - Receiver invite sent automatically on contract activation

---

### Carriers

#### My carriers
- List of all carriers who have at least one contract (any status) with
  this dispatcher org
- Columns: carrier name, company, DOT number, verification status,
  active contracts count, total shipments completed, average rating
- Verification status: Unverified / Pending / Verified / Suspended
- Only Verified carriers can be assigned to shipments
- Click any carrier → carrier profile page:
  - Contact details
  - DOT / MC / insurance details and expiry
  - Vehicle list
  - Rating breakdown
  - Contract history
  - Shipment history with this dispatcher

---

### Finances

#### Payments
- List of all payment transactions
- Tabs: Pending / Released / All
- Each row: shipment reference, carrier, amount, status, date
- Pending = funds held in escrow after shipper payment, awaiting delivery
  confirmation
- Released = escrow released to carrier post-delivery
- Disputed = flagged, held pending resolution
- Export to CSV button

#### Cost reports
- Summary analytics for the dispatcher org
- Filters: date range, carrier, contract
- Metrics displayed:
  - Total spend in period
  - Average cost per shipment
  - Average cost per mile
  - Shipment count
  - Miles covered
- Per-shipment table: reference, carrier, route, distance, rate applied,
  estimated cost, actual cost (based on GPS mileage), variance
- Export to CSV

---

### Account

#### Settings
- Company profile: name, address, logo, billing details
- Notification preferences: email and SMS toggles per event type
  (shipment assigned, in transit, delivered, contract expiring, etc.)
- Timezone

#### Users
- Manage dispatcher accounts within the organisation
- Roles within org: Admin dispatcher / Standard dispatcher
- Admin can invite new dispatcher users, deactivate accounts, reset
  passwords
- Standard dispatcher can create and manage shipments but cannot manage
  contracts or users

---

## 2. Carrier Mobile App

Separate React Native application. iOS and Android. Built with Expo bare
workflow, submitted via EAS Build.

---

### Bottom tab navigation

Four tabs: Jobs · Active · Earnings · Profile

---

#### Jobs tab — My jobs
- List of all shipments assigned to this carrier
- Tabs within: Upcoming / Completed
- Each card shows: item description, dispatcher org name, route
  (city → city), pickup window, estimated payout
- Tap any card → job detail screen:
  - Full item details, weight, handling requirements, special instructions
  - Pickup address and contact
  - Delivery address and contact
  - Estimated distance and drive time
  - Estimated payout for this shipment
  - "Navigate to pickup" button — opens Google Maps on device with pickup
    address pre-loaded (Google Maps deep link, no in-app navigation built)
  - "Start tracking" button — only enabled when carrier is within 500m of
    pickup address (geofence check)

#### Active tab — Active job
- Only shown when a job is in tracking state
- Displays:
  - Item description and shipment reference
  - Route: pickup city → delivery city
  - Distance remaining (calculated from current GPS position to delivery)
  - Live ETA (recalculated on each GPS ping)
  - Current speed (mph)
  - Last ping timestamp
  - Tracking status indicator: active (pulsing dot) / paused / no signal
  - "Navigate to delivery" button — opens Google Maps with delivery address
  - "Mark as delivered" button — requires photo upload, triggers delivery
    confirmation flow, releases escrow to carrier
- GPS background task runs continuously while in tracking state:
  - Pings every 30 seconds or every 50 metres, whichever comes first
  - Android: foreground service notification shown ("ShipMaster — tracking
    active") — cannot be dismissed while tracking
  - iOS: blue status bar indicator shown
  - Offline queue: pings stored locally if no signal, flushed to API on
    reconnect via batch endpoint

#### Earnings tab
- Summary: pending escrow / available for payout / paid out total
- Per-shipment list: reference, route, distance, rate, amount, status
- "Request payout" button → triggers Stripe Express payout to carrier's
  bank account
- Stripe Express onboarding prompt if not yet connected

#### Profile tab
- Carrier name, company, avatar
- Verification status badge
- DOT number, MC number, insurance details and expiry
- Vehicle list: add, edit, remove
- Notification preferences
- Log out

---

## 3. Receiver Web Portal

Minimal. Read-only except for delivery confirmation. Receiver account
created via invite link sent when contract is signed.

---

### Sidebar navigation

#### My deliveries
- List of all shipments where this receiver is the designated recipient
- Tabs: Active / Upcoming / Past
- Each row: item description, dispatcher org, carrier name, status,
  expected delivery window
- Tap any row → delivery detail with live map if in transit

#### Live tracking
- If a shipment is currently in transit and assigned to this receiver:
  full-width Mapbox map showing the same live carrier dot as the
  dispatcher sees
- Route line from pickup to current position
- ETA countdown
- Carrier name and contact number (for receiver to call if needed)
- "Confirm delivery received" button — appears when carrier taps
  "Mark as delivered" — receiver confirms, triggers escrow release

#### History
- Past deliveries, all statuses
- Filterable by date range
- Each row links to delivery detail with route replay (GPS ping trail)

---

## Shared Components (used across all three portals)

### Live map component
- Mapbox GL JS (web) / react-native-maps (mobile)
- Inputs: shipment ID, role (determines which controls render)
- Displays:
  - Route line: pickup → delivery (drawn from Google Directions API on
    shipment creation, stored as polyline)
  - Pickup marker (slate pin)
  - Delivery marker (slate pin)
  - Carrier live dot (gold, pulsing animation when moving)
  - ETA badge (top-right of map)
  - Speed readout (bottom of map)
- Real-time updates via Laravel Echo / Laravel Reverb WebSocket
- Polling fallback every 60 seconds if WebSocket drops
- Mobile: "Navigate" button overlay opens Google Maps

### Status pill component
- Variants: Draft · Assigned · In transit · Delivered · Disputed ·
  Cancelled
- Color coding: gray / amber / gold / green / red / gray

### Cost calculator utility
- Input: pickup coords, delivery coords, contract ID
- Calls Google Distance Matrix API for driving miles
- Applies contract rate structure
- Returns: distance miles, drive time estimate, line-by-line cost
  breakdown, total estimated cost
- Used in: New shipment Step 3, Route planner, Shipment detail page

---

## Phase 1 vs Phase 2 Scope

### Phase 1 — build now
- Dispatcher portal: Dashboard, My shipments (contracted tab only),
  New shipment (contracted), Live map, Route planner, Agreements,
  New agreement, My carriers, Payments, Cost reports, Settings, Users
- Carrier mobile app: full build
- Receiver portal: full build (invite flow, My deliveries, Live tracking,
  History)
- Contracted job flow end to end

### Phase 2 — build later
- Open jobs tab in My shipments
- Post open job wizard (dispatcher)
- Carrier job board (mobile app)
- Blind bidding and bid review
- Open job marketplace features

---

## Tech Stack Reference

| Layer | Technology |
|---|---|
| Dispatcher + Receiver portal | Next.js 15, TypeScript, Tailwind CSS v4 |
| Carrier mobile app | React Native, Expo bare workflow, TypeScript |
| Backend API | Laravel 12, PHP |
| Database | PostgreSQL (Supabase) with PostGIS |
| Real-time GPS | Laravel Reverb (WebSocket), Laravel Echo (client) |
| Maps (web) | Mapbox GL JS |
| Maps (mobile) | react-native-maps + Google Maps deep link for navigation |
| Distance / routing | Google Maps Distance Matrix API, Google Directions API |
| Payments | Stripe Connect (escrow + carrier payouts) |
| SMS | Twilio |
| Push notifications | Expo Push Notifications (FCM + APNs) |
| Auth | Laravel Sanctum |
| File storage | Supabase Storage |
| Build + deploy (web) | Vercel |
| Build + deploy (mobile) | Expo EAS Build + EAS Submit |
| Background GPS | expo-location + expo-task-manager |

---

## Design System

- Color palette: Slate (#0F1923) · Sage (#5C7A6B) · Gold (#B8975A) ·
  Cream (#F5F2EC)
- Fonts: DM Serif Display (headings, numbers) · DM Sans (UI, body)
- No navy blue. No orange. Formal but not corporate.
- Sidebar background: Slate. Active nav item: Gold accent left border.
- Cards: white surface, 0.5px border, 12px border radius.
- Status pills: rounded-full, color-coded per status variant.
