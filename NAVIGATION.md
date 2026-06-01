# Shipmater — Navigation & Feature Map

Last updated: 2026-06-01

---

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript strict, Tailwind CSS v4
- **State / Data:** TanStack Query v5, React Hook Form + Zod
- **Backend:** Laravel 13, PostgreSQL 16, Laravel Sanctum (httpOnly cookie)
- **Maps:** MapLibre GL JS + MapTiler tiles
- **Geocoding:** Nominatim (OpenStreetMap, free)
- **Realtime:** Laravel Echo + Pusher-js → Laravel Reverb WebSocket
- **Charts:** Recharts (admin dashboard only)
- **UI libs:** Sonner toasts, Framer Motion, Lucide icons

---

## Roles

Four permanent roles — no switching.

| Role | Description |
|---|---|
| `shipper` | Posts freight jobs, manages payments, contracts, preferred carriers |
| `carrier` | Bids on jobs, manages deliveries, tracks earnings |
| `receiver` | Views incoming deliveries, tracks shipments |
| `admin` | Platform-wide oversight (server-side only) |

---

## Shipper Navigation (`/shipper`)

### Overview
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Dashboard | `/shipper` | Partial | Stats cards, recent shipments, bid activity |

### Shipments
| Page | Route | DB Wired | Features |
|---|---|---|---|
| My Shipments | `/shipper/shipments` | ✅ | Shipment list, ShipmentPanel side drawer, status badges, bid count |
| Route Planner | `/shipper/route-planner` | ✅ | MapLibre map, Nominatim address geocoding, distance/cost estimate |
| Live Tracking | `/shipper/tracking` | ✅ | MapLibre map, real-time GPS ping trail, ETA display |

### Network
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Carriers | `/shipper/carriers` | ✅ | Preferred carrier list, DOT number search modal, carrier preview card, add/remove carriers |
| Contracts | `/shipper/contracts` | ✅ | Contract list with status badges, create contract modal (carrier dropdown from API), archive contracts, contract detail drawer |

### Account
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Payments | `/shipper/payments` | ✅ | Add/remove/set-default payment methods (card & bank), transaction history with filters |
| Profile | `/shipper/profile` | ✅ | **Profile tab** — name, email, phone, address · **Business tab** — company, EIN, industry, website, biz address · **Notifications tab** — email/SMS toggles per event type · **Payment tab** — payment methods · **Subscription tab** — plan display (static) |

### Off-sidebar pages
| Page | Route | Features |
|---|---|---|
| Post Job | `/shipper/post-job` | New shipment form (item, pickup, delivery, dates) |
| New Shipment | `/shipper/shipments/new` | Alternate new shipment flow |
| Shipment Detail | `/shipper/shipments/[id]` | Full shipment detail, bid list, accept bid |
| Bid Manager | `/shipper/bids` | All bids across shipments |

---

## Carrier Navigation (`/carrier`)

### Overview
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Dashboard | `/carrier` | Partial | Earnings summary, active job count, recent activity |

### Jobs
| Page | Route | DB Wired | Features |
|---|---|---|---|
| My Jobs | `/carrier/my-jobs` | ✅ | Active + past jobs, status timeline |
| Earnings | `/carrier/earnings` | ✅ | Total paid, pending escrow, per-shipment breakdown |

### Account
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Profile | `/carrier/profile` | ✅ | Personal info (name, phone) · DOT/MC/company save · DOT verified badge · Insurance status (upload or verified state) · Background check status (not started / pending / passed / failed) · Public profile preview (avatar initials, rating, total deliveries, member since) |

### Off-sidebar pages
| Page | Route | Features |
|---|---|---|
| Job Board | `/carrier/jobs` | Browse open freight jobs, place bids |

---

## Receiver Navigation (`/receiver`)

### Overview
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Dashboard | `/receiver` | Partial | Pending deliveries count, quick status summary |

### Deliveries
| Page | Route | DB Wired | Features |
|---|---|---|---|
| My Deliveries | `/receiver/shipments` | ✅ | Incoming shipment list, status badges |
| Live Tracking | `/receiver/tracking` | ✅ | Map-based shipment tracking via public token |

---

## Admin Navigation (`/admin`)

### Overview
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Dashboard | `/admin` | Partial | Recharts analytics, platform-wide stats |

### Manage
| Page | Route | DB Wired | Features |
|---|---|---|---|
| Shipments | `/admin/shipments` | ✅ | All shipments across all users, status management |
| Users | `/admin/users` | ✅ | Full user list with role display |
| Disputes | `/admin/disputes` | Partial | Dispute queue (UI built, resolution logic TBD) |

---

## Public Routes (no auth)

| Route | Features |
|---|---|
| `/login` | Sanctum SPA login |
| `/register` | Account creation with role selection |
| `/track/[token]` | Public delivery tracking page by token (no login required) |

---

## Database Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | string | bcrypt |
| role | enum | shipper / carrier / receiver / admin |
| avatar_url | string nullable | |
| timestamps | | |

### `carrier_profiles`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | cascade delete |
| company_name | string nullable | |
| phone | string nullable | |
| dot_number | string nullable | |
| dot_verified | boolean | default false |
| mc_number | string nullable | |
| insurance_verified | boolean | default false |
| background_check_status | enum | not_submitted / pending / approved / rejected |
| rating | decimal(3,2) | default 5.00 |
| total_deliveries | unsigned int | default 0 |
| timestamps | | |

### `shipper_profiles`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | cascade delete |
| phone | string(40) nullable | |
| street, city, state, zip, country | string nullable | personal address |
| company_name | string(200) nullable | |
| business_type | string(100) nullable | LLC, Corp, etc. |
| ein | string(30) nullable | |
| industry | string(100) nullable | |
| website | string(255) nullable | |
| biz_street, biz_city, biz_state, biz_zip | string nullable | business address |
| notif_email | JSON nullable | array of enabled email notification types |
| notif_sms | JSON nullable | array of enabled SMS notification types |
| timestamps | | |

### `shipments`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| shipper_id | FK → users | |
| carrier_id | FK → users nullable | assigned carrier |
| receiver_id | FK → users nullable | |
| status | enum | pending / bidding / assigned / in_transit / delivered / cancelled |
| item_description | string | |
| item_category | string nullable | |
| weight_lbs | decimal(10,2) nullable | |
| handling_requirements | JSON nullable | |
| special_notes | text nullable | |
| pickup_address, pickup_city, pickup_state | string | |
| pickup_lat, pickup_lng | decimal nullable | |
| pickup_contact_name, pickup_contact_phone | string nullable | |
| pickup_date | date nullable | |
| pickup_time_window | string nullable | |
| delivery_address, delivery_city, delivery_state | string | |
| delivery_lat, delivery_lng | decimal nullable | |
| delivery_contact_name, delivery_contact_phone | string nullable | |
| delivery_date | date nullable | |
| delivery_time_window | string nullable | |
| distance_miles | decimal(10,2) nullable | |
| agreed_cost | decimal nullable | set when bid accepted |
| tracking_token | string unique | public tracking URL token |
| delivered_at | timestamp nullable | |
| timestamps | | |

### `gps_pings`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| shipment_id | FK → shipments | cascade delete |
| lat | decimal(10,8) | |
| lng | decimal(11,8) | |
| speed | decimal(5,2) nullable | mph |
| eta | string nullable | |
| pinged_at | timestamp | |

### `payment_methods`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | cascade delete |
| type | enum | card / bank |
| brand | string(30) nullable | Visa, Mastercard, etc. |
| last4 | string(4) | |
| exp_month, exp_year | string nullable | card only |
| bank_name | string(100) nullable | bank only |
| account_type | enum nullable | checking / savings |
| is_default | boolean | default false |
| stripe_pm_id | string nullable indexed | Stripe payment method ID |
| timestamps | | |

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| shipper_id | FK → users | |
| carrier_id | FK → users | |
| shipment_id | FK → shipments nullable | |
| payment_method_id | FK → payment_methods nullable | |
| invoice_no | string(30) unique | |
| description | string | |
| category | string(80) nullable | |
| pickup, delivery | string(100) nullable | route display |
| amount | decimal(10,2) | |
| status | string | paid / pending / processing / failed / refunded |
| due_date | date | |
| notes | text nullable | |
| paid_at | timestamp nullable | |
| timestamps | | |

### `preferred_carriers`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| shipper_id | FK → users | |
| carrier_id | FK → users | |
| status | string | active / pending / inactive |
| timestamps | | |
| unique | | (shipper_id, carrier_id) |

### `contracts`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| shipper_id | FK → users | |
| carrier_id | FK → users | |
| rate_type | string(20) | Per mile / Flat rate / Hourly |
| rate | decimal(10,2) | |
| fuel_surcharge | decimal(8,2) nullable | |
| detention_rate | decimal(8,2) nullable | |
| free_time_hrs | unsigned tinyint | default 2 |
| equipment_type | string(30) nullable | |
| max_weight_lbs | unsigned int nullable | |
| coverage | string(200) | lane/region covered |
| payment_terms | string(20) | default Net 30 |
| priority | string(20) | default Standard |
| auto_renew | boolean | default false |
| valid_from, valid_to | date | |
| status | string | active / pending / expired / draft |
| notes | text nullable | |
| shipments_under | unsigned int | count of shipments against contract |
| timestamps | | |

---

## API Endpoints (`/api/v1/`)

| Method | Path | Auth | Controller | Notes |
|---|---|---|---|---|
| GET | `/track/{token}` | Public | TrackController@show | |
| POST | `/track/{token}` | Public | TrackController@confirm | Delivery confirmation |
| POST | `/auth/register` | Guest | AuthController@register | |
| POST | `/auth/login` | Guest | AuthController@login | |
| GET | `/user` | Auth | AuthController@user | |
| POST | `/auth/logout` | Auth | AuthController@logout | |
| GET | `/shipments` | Auth | ShipmentController@index | Role-aware query |
| POST | `/shipments` | Auth | ShipmentController@store | |
| GET | `/shipments/{id}` | Auth | ShipmentController@show | |
| POST | `/shipments/{id}/ping` | Auth | ShipmentController@ping | GPS ping |
| GET | `/jobs` | Auth | JobController@index | Carrier job board |
| GET | `/carrier/earnings` | Auth | CarrierController@earnings | |
| GET | `/carrier/profile` | Auth | CarrierController@getProfile | |
| PUT | `/carrier/profile` | Auth | CarrierController@updateProfile | |
| GET | `/carriers` | Auth | CarrierController@index | `?dot=` for lookup |
| GET | `/shipper/profile` | Auth | ShipperProfileController@show | |
| PUT | `/shipper/profile` | Auth | ShipperProfileController@update | |
| GET | `/payment-methods` | Auth | PaymentMethodController@index | |
| POST | `/payment-methods` | Auth | PaymentMethodController@store | |
| DELETE | `/payment-methods/{id}` | Auth | PaymentMethodController@destroy | |
| POST | `/payment-methods/{id}/default` | Auth | PaymentMethodController@setDefault | |
| GET | `/transactions` | Auth | TransactionController@index | |
| GET | `/preferred-carriers` | Auth | PreferredCarrierController@index | |
| POST | `/preferred-carriers` | Auth | PreferredCarrierController@store | |
| DELETE | `/preferred-carriers/{id}` | Auth | PreferredCarrierController@destroy | |
| GET | `/contracts` | Auth | ContractController@index | |
| POST | `/contracts` | Auth | ContractController@store | |
| PUT | `/contracts/{id}` | Auth | ContractController@update | |
| DELETE | `/contracts/{id}` | Auth | ContractController@destroy | |

---

## Frontend API Client (`lib/api.ts`)

```ts
authApi             — login, logout, register, me
shipmentApi         — list, get, create, getBids, ping
bidApi              — place, accept
jobApi              — list
carrierApi          — earnings, list, lookup(dot)
trackApi            — get(token), confirm(token)
paymentApi          — list, create, destroy, setDefault
transactionApi      — list
preferredCarrierApi — list, add, remove
contractApi         — list, create, update, destroy
profileApi          — getShipper, updateShipper, getCarrier, updateCarrier
```
