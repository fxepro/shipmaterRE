# ShipMaster — Next.js Frontend Developer Prompt

## Project Overview

Build the **ShipMaster** frontend: a multi-role freight tracking SaaS platform. Three user roles — **Shipper**, **Carrier**, and **Receiver** — each see a distinct dashboard experience. The frontend communicates with a **Laravel 12 REST API** backend over HTTPS, and uses **Laravel Echo + Laravel Reverb** for real-time WebSocket GPS updates.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + CSS variables |
| UI Components | shadcn/ui (customized to design system) |
| Maps | Mapbox GL JS |
| Real-time | Laravel Echo + Pusher-js (connecting to Laravel Reverb WS) |
| Auth | Laravel Sanctum (httpOnly cookie, SSR-compatible) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toast) |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| Icons | Lucide React |
| Animation | Framer Motion (page transitions + map marker) |
| Payments frontend | Stripe.js (Elements) |

---

## Design System

### Color Palette

```css
:root {
  /* Primary palette — NO navy blue, NO orange */
  --color-slate:       #0F1923;  /* Primary dark — headers, sidebar bg, primary buttons */
  --color-slate-80:    #1E2D3D;  /* Secondary dark — hover states, table headers */
  --color-slate-60:    #2E4257;  /* Tertiary dark — borders on dark bg */

  --color-sage:        #5C7A6B;  /* Accent green — verified badges, success states */
  --color-sage-light:  #8FAF9F;  /* Muted sage — icons on dark bg */
  --color-sage-pale:   #D4E5DD;  /* Sage tint — verified badge backgrounds */

  --color-gold:        #B8975A;  /* Action accent — CTAs, active states, live indicators */
  --color-gold-light:  #D4B47E;  /* Gold mid — hover on gold elements */
  --color-gold-pale:   #F0E6D0;  /* Gold tint — bid accept backgrounds, highlights */

  --color-cream:       #F5F2EC;  /* Page background */
  --color-cream-dark:  #EAE6DE;  /* Card borders, table row dividers, input backgrounds */
  --color-white:       #FDFCFA;  /* Card surfaces */

  /* Semantic */
  --color-text:        #0F1923;  /* Body text */
  --color-text-muted:  #4A5568;  /* Secondary text */
  --color-text-faint:  #8A9BB0;  /* Labels, metadata, placeholders */
  --color-success:     #2E7D5B;
  --color-danger:      #C0392B;
  --color-warning:     #A06B00;
}
```

### Typography

```css
/* Import in layout.tsx */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

:root {
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
}
```

**Usage rules:**
- `DM Serif Display` — page titles, stat numbers, hero headings, price displays. Use italic weight (`font-italic`) for emphasis.
- `DM Sans` — all UI text: labels, buttons, table data, sidebar, metadata. Weight 400 regular, 500 medium, 600 semi-bold only.
- Section labels: `text-[10px] font-medium uppercase tracking-[0.07em] text-[--color-text-faint]`
- Never use Inter, Roboto, or system-ui as a visible choice.

### Spacing & Shape

- Page background: `bg-[--color-cream]`
- Cards: `bg-[--color-white] rounded-xl border border-[--color-cream-dark] shadow-[0_1px_3px_rgba(0,0,0,0.05)]`
- Border radius: `rounded-lg` (8px) for inputs/buttons, `rounded-xl` (12px) for cards, `rounded-2xl` for modals
- Input fields: `bg-[--color-cream] border border-[--color-cream-dark] rounded-lg px-3 py-2 text-sm`
- Sidebar width: 220px fixed, collapsible on mobile

---

## Application Structure

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    register/role-select/page.tsx      ← shipper or carrier at signup
  (dashboard)/
    layout.tsx                          ← shared sidebar + topbar shell
    shipper/
      page.tsx                          ← shipper dashboard
      shipments/page.tsx
      shipments/[id]/page.tsx           ← shipment detail + live GPS map
      post-job/page.tsx
      bids/page.tsx
      payments/page.tsx
    carrier/
      page.tsx                          ← carrier dashboard
      jobs/page.tsx                     ← open job board
      my-jobs/page.tsx
      earnings/page.tsx
      profile/page.tsx                  ← verification / DOT upload
    admin/
      page.tsx
      users/page.tsx
      shipments/page.tsx
      disputes/page.tsx
  track/
    [token]/page.tsx                    ← PUBLIC receiver tracking page (no auth)
  api/
    auth/[...nextauth]/route.ts         ← Sanctum cookie proxy
components/
  layout/
    Sidebar.tsx
    Topbar.tsx
    RoleSwitcher.tsx
  ui/                                   ← shadcn/ui components (customized)
  maps/
    LiveMap.tsx                         ← Mapbox + real-time marker
    StaticRouteMap.tsx
  shipments/
    ShipmentCard.tsx
    ShipmentTable.tsx
    BidCard.tsx
    StatusPill.tsx
  forms/
    PostJobForm.tsx
    BidForm.tsx
  shared/
    StatCard.tsx
    ActivityFeed.tsx
    EmptyState.tsx
    VerifiedBadge.tsx
lib/
  api.ts                                ← axios instance pointing to Laravel
  echo.ts                               ← Laravel Echo + Reverb setup
  auth.ts                               ← Sanctum session helpers
  queryClient.ts
types/
  shipment.ts
  user.ts
  bid.ts
  gps.ts
```

---

## Core Components

### Sidebar

```tsx
// Role-aware navigation — items shown depend on auth user's active role
// Sections: Overview | Marketplace | Account
// Bottom: RoleSwitcher component (if user has multiple roles)
// Active item: bg-[--color-white] rounded-lg shadow-sm
// Active icon: text-[--color-gold]
// Section labels: text-[10px] uppercase tracking-widest text-[--color-text-faint]
// Collapsed mobile: icon-only, tooltip on hover
```

### StatCard

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;  // CSS color value — default var(--color-gold)
  trend?: { direction: 'up' | 'down'; label: string };
}

// Accent: 3px colored bar at top of card
// Value: DM Serif Display, text-3xl
// Label: 10px uppercase tracking-wide text-[--color-text-faint]
```

### StatusPill

```tsx
type ShipmentStatus = 'pending' | 'bids_open' | 'confirmed' | 'in_transit' | 'delivered' | 'disputed' | 'cancelled';

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending:    'bg-[--color-cream-dark] text-[--color-text-faint]',
  bids_open:  'bg-[--color-sage-pale] text-[--color-sage]',
  confirmed:  'bg-[--color-gold-pale] text-[--color-gold]',
  in_transit: 'bg-[--color-gold-pale] text-[--color-gold]',
  delivered:  'bg-emerald-50 text-emerald-700',
  disputed:   'bg-red-50 text-red-700',
  cancelled:  'bg-gray-100 text-gray-500',
};
// Shape: rounded-full px-2.5 py-0.5 text-[10px] font-medium
```

### LiveMap

```tsx
// Mapbox GL JS component
// Props: shipmentId, initialCoordinates, deliveryAddress
// Subscribes to Laravel Echo private channel: `shipment.{shipmentId}`
// Listens for: GpsPingReceived event → animates marker to new lat/lng
// Shows: route line from pickup to current, current position marker (gold dot, pulsing ring)
// Shows: delivery destination marker (slate pin)
// Shows: ETA badge in top-right corner of map
// Map style: mapbox://styles/mapbox/light-v11 (clean, matches cream palette)
// Marker: custom gold circle SVG, CSS pulse animation

// Echo setup:
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;
const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
  wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
  wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
  forceTLS: process.env.NODE_ENV === 'production',
  enabledTransports: ['ws', 'wss'],
});
```

### Public Receiver Tracking Page `/track/[token]`

```tsx
// NO authentication required — token in URL is a signed, time-limited JWT
// Full-screen Mapbox map (height: 100vh)
// Overlay card (bottom-left) showing:
//   - Item description (e.g. "Grandfather Clock")
//   - Route: Denver, CO → Dallas, TX  
//   - ETA countdown: "Arriving in 14h 22m"
//   - Status pill
//   - "Confirm delivery received" button (shown when carrier marks arrived)
// Real-time updates via same Echo subscription (public channel for this shipment token)
// Page title: "Your shipment is on the way · ShipMaster"
// No sidebar, no navigation — completely clean, single-purpose page
// Mobile-first layout
```

---

## Role Dashboards

### Shipper Dashboard (`/shipper`)

**Top stat row:** Active Shipments · Bids Received · Delivered (all time) · Total Spent

**Main content:**
1. Active shipment with embedded mini-map (if one is in transit)
2. Shipments table — columns: Item, Route, Carrier, Status, ETA, Actions
3. Two-column bottom row: Incoming Bids card + Activity Feed card

**Post Job flow** (`/shipper/post-job`):
- Step 1: Item details (name, weight, dimensions, photos, special handling notes)
- Step 2: Pickup + delivery addresses (Google Places autocomplete)
- Step 3: Preferred dates + budget range
- Step 4: Review + publish
- Progress: step indicator using gold accent bar

### Carrier Dashboard (`/carrier`)

**Top stat row:** Active Jobs · Earnings This Month · Total Delivered · Rating (★ with one decimal)

**Main content:**
1. Open job board — card grid showing available jobs near their home base
   - Each card: item type, route, weight, posted time, "Place Bid" CTA in gold
   - Filter bar: distance radius, item type, date range
2. My Active Jobs — compact list with GPS "Start Tracking" button
3. Payout summary card — pending escrow, available balance, "Request Payout"

**Profile / Verification** (`/carrier/profile`):
- DOT number input + verification status badge
- Insurance document upload
- MC authority number
- Background check status
- Public carrier profile preview

### Admin Dashboard (`/admin`)

**Stat row:** Total Shipments · Active Today · Disputed · Platform Revenue

**Main content:**
1. All shipments table with global search + status filter
2. User management table (shipper/carrier/both)
3. Disputes queue with resolution actions
4. Platform metrics: shipments per day chart (recharts, using slate/gold colors)

---

## API Integration

```typescript
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // e.g. https://api.shipmaster.com
  withCredentials: true,                      // Sanctum cookie
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

// Key endpoints:
// POST   /api/v1/auth/login
// POST   /api/v1/auth/logout
// GET    /api/v1/user
// GET    /api/v1/shipments
// POST   /api/v1/shipments
// GET    /api/v1/shipments/{id}
// GET    /api/v1/shipments/{id}/bids
// POST   /api/v1/shipments/{id}/bids
// PUT    /api/v1/bids/{id}/accept
// POST   /api/v1/shipments/{id}/ping        ← carrier GPS update
// GET    /api/v1/jobs                        ← open job board (carrier)
// GET    /api/v1/carrier/earnings
// POST   /api/v1/track/{token}              ← receiver confirm delivery
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.shipmaster.com
NEXT_PUBLIC_REVERB_APP_KEY=your-reverb-key
NEXT_PUBLIC_REVERB_HOST=api.shipmaster.com
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
NEXT_PUBLIC_STRIPE_PK=pk_live_your_stripe_key
```

---

## Key UX Rules

1. **No page is ever empty** — every empty state has an illustration-style icon, a headline in DM Serif Display, and a clear CTA button.
2. **GPS is always the hero** — any page involving an active shipment shows the live map prominently. Never hide it below the fold.
3. **Price is always DM Serif Display** — all dollar amounts use the display font, not the UI font. Makes them feel significant.
4. **Gold = action** — the gold color is reserved exclusively for primary CTAs, active states, and live GPS indicators. Don't use it decoratively.
5. **Sage = trust** — the sage green color is for verification badges, DOT verified status, and delivery confirmed states.
6. **Slate = structure** — slate is the sidebar, the header, and primary action buttons. It anchors the layout.
7. **Toast notifications** — use Sonner. GPS events trigger subtle bottom-right toasts (e.g. "Carrier crossed into Oklahoma · ETA updated").
8. **Loading states** — skeleton loaders in `bg-[--color-cream-dark]` with shimmer animation. Never spinners on cards.
9. **Mobile sidebar** — collapses to a bottom tab bar on < 768px with 4 tabs: Home, Shipments, Track, Account.
10. **Role switcher** — if a user holds both shipper and carrier roles, show a role switcher in the sidebar footer. Switching roles re-routes to the appropriate dashboard and updates the sidebar nav.

---

## Deployment

- **Host:** Vercel
- **Build command:** `next build`
- **Node version:** 20+
- **Environment:** Production env vars set in Vercel dashboard
- **CORS:** Laravel backend must allow `https://shipmaster.com` with `withCredentials`
- **CSP:** Allow `wss://api.shipmaster.com` for Reverb WebSocket connection

---

## Deliverables for MVP

- [ ] Auth flow (login, register, role selection)
- [ ] Shipper dashboard with shipment table and live GPS map
- [ ] Post Job multi-step form
- [ ] Carrier job board + bid placement form
- [ ] Carrier GPS ping (mobile browser, using `navigator.geolocation.watchPosition`)
- [ ] Public receiver tracking page (`/track/[token]`)
- [ ] Admin dashboard (read-only tables, no actions required at MVP)
- [ ] Responsive layout (sidebar collapses to bottom tabs on mobile)
- [ ] Design system documented in `/components/ui/` with customized shadcn theme
