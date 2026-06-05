<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarrierDocument;
use App\Models\CarrierProfile;
use App\Models\CarrierVehicle;
use App\Models\ServiceType;
use App\Models\Shipment;
use App\Models\User;
use App\Services\ServiceTypeRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CarrierController extends Controller
{
    // ── Profile shape helper (matches ShipperProfileController pattern) ────────

    private function shape(Request $request): array
    {
        $user    = $request->user();
        $profile = $user->carrierProfile;

        // Calculate completion percentage
        $completion = $this->calculateCompletion($profile);

        return [
            'name'                    => $user->name,
            'email'                   => $user->email,
            'carrier_type'            => $profile?->carrier_type ?? 'sole_proprietor',
            'verification_status'     => $profile?->verification_status ?? 'incomplete',
            'completion_percentage'   => $completion,

            // Personal
            'date_of_birth'           => $profile?->date_of_birth,
            'ssn_last_4'              => $profile?->ssn_last_4,
            'photo_url'               => $profile?->photo_url,

            // DOT-Commercial
            'dot_number'              => $profile?->dot_number ?? '',
            'mc_number'               => $profile?->mc_number ?? '',
            'cdl_number'              => $profile?->cdl_number,
            'cdl_issuing_state'       => $profile?->cdl_issuing_state,
            'cdl_expiry_date'         => $profile?->cdl_expiry_date,
            'cdl_class'               => $profile?->cdl_class,
            'usdot_number'            => $profile?->usdot_number,
            'hazmat_endorsement'      => (bool) ($profile?->hazmat_endorsement ?? false),
            'hazmat_expiry_date'      => $profile?->hazmat_expiry_date,
            'tanker_endorsement'      => (bool) ($profile?->tanker_endorsement ?? false),
            'passenger_endorsement'   => (bool) ($profile?->passenger_endorsement ?? false),
            'dot_verified'            => (bool) ($profile?->dot_verified ?? false),
            'company_name'            => $profile?->company_name ?? '',
            'phone'                   => $profile?->phone ?? '',

            // Medical
            'medical_examiner_name'   => $profile?->medical_examiner_name,
            'dot_medical_expiry'      => $profile?->dot_medical_expiry,
            'drug_test_date'          => $profile?->drug_test_date,
            'drug_test_result'        => $profile?->drug_test_result,

            // Insurance
            'insurance_verified'      => (bool) ($profile?->insurance_verified ?? false),
            'background_check_status' => $profile?->background_check_status ?? 'not_started',
            'auto_policy_number'      => $profile?->auto_policy_number,
            'auto_insurer_name'       => $profile?->auto_insurer_name,
            'auto_coverage_amount'    => $profile?->auto_coverage_amount,
            'auto_effective_date'     => $profile?->auto_effective_date,
            'auto_expiry_date'        => $profile?->auto_expiry_date,
            'cargo_policy_number'     => $profile?->cargo_policy_number,
            'cargo_insurer_name'      => $profile?->cargo_insurer_name,
            'cargo_coverage_amount'   => $profile?->cargo_coverage_amount,
            'cargo_expiry_date'       => $profile?->cargo_expiry_date,

            // Stripe
            'stripe_account_id'       => $profile?->stripe_account_id,
            'stripe_account_status'   => $profile?->stripe_account_status ?? 'not_connected',

            // Stats
            'rating'                  => (float) ($profile?->rating ?? 0),
            'total_deliveries'        => $profile?->total_deliveries ?? 0,
            'member_since'            => $user->created_at->format('M Y'),

            // Service types
            'service_type_keys'       => $profile?->serviceTypes->pluck('key')->toArray() ?? [],
            'required_fields'         => ServiceTypeRules::requiredFields(
                $profile?->serviceTypes->pluck('key')->toArray() ?? []
            ),
            'relevant_tabs'           => ServiceTypeRules::relevantTabs(
                $profile?->serviceTypes->pluck('key')->toArray() ?? []
            ),
        ];
    }

    private function calculateCompletion($profile): int
    {
        if (!$profile) return 0;

        $fields = [
            'photo_url'           => 10,
            'date_of_birth'       => 10,
            'ssn_last_4'          => 10,
            'cdl_number'          => 15,
            'usdot_number'        => 15,
            'dot_medical_expiry'  => 15,
            'hazmat_endorsement'  => 5,
        ];

        $completed = 0;
        foreach ($fields as $field => $weight) {
            if ($profile->{$field}) $completed += $weight;
        }

        return min($completed, 100);
    }

    // ── GET /api/v1/carrier/profile ──────────────────────────────────────────

    public function show(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);
        $request->user()->load('carrierProfile.serviceTypes');

        return response()->json(['data' => $this->shape($request)]);
    }

    // ── PUT /api/v1/carrier/profile ──────────────────────────────────────────

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isCarrier(), 403);

        $validated = $request->validate([
            'name'                => ['sometimes', 'string', 'max:255'],
            'email'               => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],

            // Personal
            'date_of_birth'       => ['sometimes', 'nullable', 'date'],
            'ssn_last_4'          => ['sometimes', 'nullable', 'string', 'max:4'],
            'photo_url'           => ['sometimes', 'nullable', 'string'],

            // DOT-Commercial
            'cdl_number'            => ['sometimes', 'nullable', 'string', 'max:20'],
            'cdl_issuing_state'     => ['sometimes', 'nullable', 'string', 'max:2'],
            'cdl_expiry_date'       => ['sometimes', 'nullable', 'date'],
            'cdl_class'             => ['sometimes', 'nullable', 'string', 'max:5'],
            'usdot_number'          => ['sometimes', 'nullable', 'string', 'max:20'],
            'mc_number'             => ['sometimes', 'nullable', 'string', 'max:30'],
            'hazmat_endorsement'    => ['sometimes', 'boolean'],
            'hazmat_expiry_date'    => ['sometimes', 'nullable', 'date'],
            'tanker_endorsement'    => ['sometimes', 'boolean'],
            'passenger_endorsement' => ['sometimes', 'boolean'],
            'dot_number'            => ['sometimes', 'nullable', 'string', 'max:20'],
            'company_name'          => ['sometimes', 'nullable', 'string', 'max:200'],
            'phone'                 => ['sometimes', 'nullable', 'string', 'max:40'],

            // Insurance
            'auto_policy_number'   => ['sometimes', 'nullable', 'string'],
            'auto_insurer_name'    => ['sometimes', 'nullable', 'string'],
            'auto_coverage_amount' => ['sometimes', 'nullable', 'numeric'],
            'auto_effective_date'  => ['sometimes', 'nullable', 'date'],
            'auto_expiry_date'     => ['sometimes', 'nullable', 'date'],
            'cargo_policy_number'  => ['sometimes', 'nullable', 'string'],
            'cargo_insurer_name'   => ['sometimes', 'nullable', 'string'],
            'cargo_coverage_amount'=> ['sometimes', 'nullable', 'numeric'],
            'cargo_expiry_date'    => ['sometimes', 'nullable', 'date'],

            // Medical
            'medical_examiner_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'dot_medical_expiry'    => ['sometimes', 'nullable', 'date'],
            'drug_test_date'        => ['sometimes', 'nullable', 'date'],
            'drug_test_result'      => ['sometimes', 'nullable', 'string', 'max:20'],

            // Service types
            'service_type_keys'     => ['sometimes', 'array'],
            'service_type_keys.*'   => ['string'],
        ]);

        // Update users table fields
        $userFields = array_intersect_key($validated, array_flip(['name', 'email']));
        if ($userFields) {
            $user->update($userFields);
        }

        // Handle service types separately (pivot)
        $serviceTypeKeys = $validated['service_type_keys'] ?? null;
        $profileData = array_diff_key($validated, array_flip(['name', 'email', 'service_type_keys']));

        // Update profile table fields
        $profile = CarrierProfile::updateOrCreate(['user_id' => $user->id], $profileData ?: []);

        // Sync service types if provided
        if ($serviceTypeKeys !== null) {
            $ids = ServiceType::whereIn('key', $serviceTypeKeys)->pluck('id');
            $profile->serviceTypes()->sync($ids);
        }

        $user->load('carrierProfile.serviceTypes');

        return response()->json(['data' => $this->shape($request)]);
    }

    // ── GET /api/v1/carrier/earnings ────────────────────────────────────────

    public function earnings(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $user      = $request->user();
        $shipments = Shipment::where('carrier_id', $user->id)
            ->whereIn('status', ['delivered', 'in_transit', 'assigned'])
            ->get(['id', 'status', 'agreed_cost', 'pickup_city', 'pickup_state',
                   'delivery_city', 'delivery_state', 'distance_miles', 'delivered_at']);

        $delivered     = $shipments->where('status', 'delivered');
        $pendingEscrow = $shipments->whereIn('status', ['in_transit', 'assigned']);
        $totalPaid     = $delivered->sum('agreed_cost');
        $pendingAmount = $pendingEscrow->sum('agreed_cost');

        return response()->json([
            'data' => [
                'total_paid'     => (float) $totalPaid,
                'pending_escrow' => (float) $pendingAmount,
                'shipments'      => $shipments->map(fn ($s) => [
                    'id'             => $s->id,
                    'status'         => $s->status,
                    'amount'         => (float) $s->agreed_cost,
                    'route'          => "{$s->pickup_city}, {$s->pickup_state} → {$s->delivery_city}, {$s->delivery_state}",
                    'distance_miles' => (float) $s->distance_miles,
                    'delivered_at'   => $s->delivered_at?->toISOString(),
                ]),
            ],
        ]);
    }

    // ── POST /api/v1/carrier/payout ─────────────────────────────────────────

    public function requestPayout(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $validated = $request->validate([
            'method' => ['required', 'in:stripe,bank'],
        ]);

        $profile = $request->user()->carrierProfile;

        if (!$profile?->stripe_account_id || $profile->stripe_account_status !== 'verified') {
            return response()->json([
                'error' => 'You must connect and verify your Stripe account before requesting a payout.',
            ], 422);
        }

        // Stripe handles payouts automatically on a rolling basis.
        // For instant payouts, trigger via Stripe API.
        return response()->json([
            'message' => 'Payout request received. Funds will be transferred within 1-2 business days.',
            'method'  => $validated['method'],
        ]);
    }

    // ── GET /api/v1/carrier/documents ───────────────────────────────────────

    public function getDocuments(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $profile = $request->user()->carrierProfile;
        if (!$profile) return response()->json(['data' => []]);

        return response()->json([
            'data' => $profile->documents()
                ->orderBy('type')
                ->get()
                ->map(fn($d) => [
                    'id'              => $d->id,
                    'type'            => $d->type,
                    'name'            => $d->name,
                    'url'             => $d->url,
                    'policy_number'   => $d->policy_number,
                    'insurer_name'    => $d->insurer_name,
                    'coverage_amount' => $d->coverage_amount,
                    'effective_date'  => $d->effective_date?->toDateString(),
                    'expiry_date'     => $d->expiry_date?->toDateString(),
                    'verified_at'     => $d->verified_at?->toISOString(),
                ]),
        ]);
    }

    // ── POST /api/v1/carrier/documents ──────────────────────────────────────

    public function uploadDocument(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $validated = $request->validate([
            'document'        => ['required', 'file', 'max:10240'],
            'type'            => ['required', 'string'],
            'name'            => ['sometimes', 'string'],
            'vehicle_id'      => ['sometimes', 'nullable', 'integer'],
            'policy_number'   => ['sometimes', 'nullable', 'string'],
            'insurer_name'    => ['sometimes', 'nullable', 'string'],
            'coverage_amount' => ['sometimes', 'nullable', 'numeric'],
            'effective_date'  => ['sometimes', 'nullable', 'date'],
            'expiry_date'     => ['sometimes', 'nullable', 'date'],
        ]);

        $profile = $request->user()->carrierProfile()->firstOrCreate(['user_id' => $request->user()->id]);

        // Store file — using local storage for now; swap for S3/Supabase in production
        $file = $request->file('document');
        $path = $file->store("carrier-docs/{$profile->id}", 'public');

        $doc = CarrierDocument::create([
            'carrier_profile_id' => $profile->id,
            'carrier_vehicle_id' => $validated['vehicle_id'] ?? null,
            'type'               => $validated['type'],
            'name'               => $validated['name'] ?? $file->getClientOriginalName(),
            'url'                => asset('storage/' . $path),
            'mime_type'          => $file->getMimeType(),
            'size'               => $file->getSize(),
            'policy_number'      => $validated['policy_number'] ?? null,
            'insurer_name'       => $validated['insurer_name'] ?? null,
            'coverage_amount'    => $validated['coverage_amount'] ?? null,
            'effective_date'     => $validated['effective_date'] ?? null,
            'expiry_date'        => $validated['expiry_date'] ?? null,
        ]);

        return response()->json(['data' => $doc], 201);
    }

    // ── GET /api/v1/carrier/vehicles ────────────────────────────────────────

    public function getVehicles(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $profile = $request->user()->carrierProfile;
        if (!$profile) return response()->json(['data' => []]);

        return response()->json([
            'data' => $profile->vehicles()
                ->orderByDesc('is_primary')
                ->orderBy('created_at')
                ->get()
                ->map(fn($v) => [
                    'id'                   => $v->id,
                    'type'                 => $v->type,
                    'year'                 => $v->year,
                    'make'                 => $v->make,
                    'model'                => $v->model,
                    'vin'                  => $v->vin,
                    'license_plate'        => $v->license_plate,
                    'license_plate_state'  => $v->license_plate_state,
                    'gvwr'                 => $v->gvwr,
                    'max_payload'          => $v->max_payload,
                    'cargo_length'         => $v->cargo_length,
                    'cargo_width'          => $v->cargo_width,
                    'cargo_height'         => $v->cargo_height,
                    'liftgate'             => $v->liftgate,
                    'climate_controlled'   => $v->climate_controlled,
                    'enclosed'             => $v->enclosed,
                    'is_primary'           => $v->is_primary,
                    'registration_expiry'  => $v->registration_expiry?->toDateString(),
                ]),
        ]);
    }

    // ── POST /api/v1/carrier/vehicles ───────────────────────────────────────

    public function createVehicle(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $validated = $request->validate([
            'type'                 => ['required', 'string'],
            'year'                 => ['required', 'string', 'max:4'],
            'make'                 => ['required', 'string'],
            'model'                => ['required', 'string'],
            'vin'                  => ['sometimes', 'nullable', 'string'],
            'license_plate'        => ['sometimes', 'nullable', 'string'],
            'license_plate_state'  => ['sometimes', 'nullable', 'string', 'max:2'],
            'gvwr'                 => ['sometimes', 'nullable', 'numeric'],
            'max_payload'          => ['sometimes', 'nullable', 'numeric'],
            'cargo_length'         => ['sometimes', 'nullable', 'numeric'],
            'cargo_width'          => ['sometimes', 'nullable', 'numeric'],
            'cargo_height'         => ['sometimes', 'nullable', 'numeric'],
            'liftgate'             => ['sometimes', 'boolean'],
            'climate_controlled'   => ['sometimes', 'boolean'],
            'enclosed'             => ['sometimes', 'boolean'],
            'is_primary'           => ['sometimes', 'boolean'],
            'registration_expiry'  => ['sometimes', 'nullable', 'date'],
        ]);

        $profile = $request->user()->carrierProfile()->firstOrCreate(['user_id' => $request->user()->id]);

        // If setting as primary, demote all others
        if (!empty($validated['is_primary'])) {
            $profile->vehicles()->update(['is_primary' => false]);
        }

        // First vehicle is always primary
        if ($profile->vehicles()->count() === 0) {
            $validated['is_primary'] = true;
        }

        $vehicle = $profile->vehicles()->create($validated);

        return response()->json(['data' => $vehicle], 201);
    }

    // ── PUT /api/v1/carrier/vehicles/{id} ───────────────────────────────────

    public function updateVehicle(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $profile = $request->user()->carrierProfile;
        $vehicle = $profile->vehicles()->findOrFail($id);

        $validated = $request->validate([
            'type'                 => ['sometimes', 'string'],
            'year'                 => ['sometimes', 'string', 'max:4'],
            'make'                 => ['sometimes', 'string'],
            'model'                => ['sometimes', 'string'],
            'vin'                  => ['sometimes', 'nullable', 'string'],
            'license_plate'        => ['sometimes', 'nullable', 'string'],
            'license_plate_state'  => ['sometimes', 'nullable', 'string', 'max:2'],
            'gvwr'                 => ['sometimes', 'nullable', 'numeric'],
            'max_payload'          => ['sometimes', 'nullable', 'numeric'],
            'cargo_length'         => ['sometimes', 'nullable', 'numeric'],
            'cargo_width'          => ['sometimes', 'nullable', 'numeric'],
            'cargo_height'         => ['sometimes', 'nullable', 'numeric'],
            'liftgate'             => ['sometimes', 'boolean'],
            'climate_controlled'   => ['sometimes', 'boolean'],
            'enclosed'             => ['sometimes', 'boolean'],
            'is_primary'           => ['sometimes', 'boolean'],
            'registration_expiry'  => ['sometimes', 'nullable', 'date'],
        ]);

        if (!empty($validated['is_primary'])) {
            $profile->vehicles()->update(['is_primary' => false]);
        }

        $vehicle->update($validated);

        return response()->json(['data' => $vehicle]);
    }

    // ── DELETE /api/v1/carrier/vehicles/{id} ────────────────────────────────

    public function deleteVehicle(Request $request, int $id): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $profile = $request->user()->carrierProfile;
        $vehicle = $profile->vehicles()->findOrFail($id);
        $wasPrimary = $vehicle->is_primary;
        $vehicle->delete();

        // Promote next vehicle to primary if we deleted the primary
        if ($wasPrimary) {
            $profile->vehicles()->oldest()->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Vehicle deleted']);
    }

    // ── GET /api/v1/carriers ────────────────────────────────────────────────
    // Supports: ?search= ?dot= ?verified= ?hazmat= ?tanker= ?min_rating= ?sort=

    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'carrier')->with('carrierProfile.serviceTypes');

        // Search: name, company, DOT, MC
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhereHas('carrierProfile', fn ($p) =>
                      $p->where('company_name', 'ilike', "%{$search}%")
                        ->orWhere('dot_number', 'ilike', "%{$search}%")
                        ->orWhere('mc_number', 'ilike', "%{$search}%")
                        ->orWhere('usdot_number', 'ilike', "%{$search}%")
                  );
            });
        }

        // Exact DOT lookup (for add-carrier modal)
        if ($dot = $request->query('dot')) {
            $query->whereHas('carrierProfile', fn ($q) =>
                $q->where('dot_number', $dot)->orWhere('usdot_number', $dot)
            );
        }

        // Verified only
        if ($request->query('verified')) {
            $query->whereHas('carrierProfile', fn ($q) =>
                $q->where('verification_status', 'verified')
            );
        }

        // Endorsement filters
        if ($request->query('hazmat')) {
            $query->whereHas('carrierProfile', fn ($q) => $q->where('hazmat_endorsement', true));
        }
        if ($request->query('tanker')) {
            $query->whereHas('carrierProfile', fn ($q) => $q->where('tanker_endorsement', true));
        }
        if ($request->query('passenger')) {
            $query->whereHas('carrierProfile', fn ($q) => $q->where('passenger_endorsement', true));
        }

        // Minimum rating
        if ($minRating = $request->query('min_rating')) {
            $query->whereHas('carrierProfile', fn ($q) =>
                $q->where('rating', '>=', (float) $minRating)
            );
        }

        // Carrier type (business structure)
        if ($type = $request->query('carrier_type')) {
            $query->whereHas('carrierProfile', fn ($q) => $q->where('carrier_type', $type));
        }

        // Service types filter (what they transport)
        if ($serviceTypes = $request->query('service_types')) {
            $keys = is_array($serviceTypes) ? $serviceTypes : explode(',', $serviceTypes);
            $query->whereHas('carrierProfile.serviceTypes', fn ($q) => $q->whereIn('key', $keys));
        }

        // Sorting
        $sort = $request->query('sort', 'rating');
        $query->join('carrier_profiles as cp', 'cp.user_id', '=', 'users.id');
        match ($sort) {
            'rating'      => $query->orderByDesc('cp.rating'),
            'deliveries'  => $query->orderByDesc('cp.total_deliveries'),
            'newest'      => $query->orderByDesc('users.created_at'),
            'oldest'      => $query->orderBy('users.created_at'),
            default       => $query->orderByDesc('cp.rating'),
        };

        $carriers = $query->select('users.*')->get();

        return response()->json([
            'data' => $carriers->map(function ($c) {
                $profile = $c->carrierProfile;
                $parts   = explode(' ', $c->name);
                $avatar  = strtoupper(
                    substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : '')
                );

                return [
                    'id'                   => $c->id,
                    'name'                 => $c->name,
                    'email'                => $c->email,
                    'company_name'         => $profile?->company_name ?? '',
                    'dot_number'           => $profile?->dot_number ?? $profile?->usdot_number ?? '',
                    'mc_number'            => $profile?->mc_number ?? '',
                    'phone'                => $profile?->phone ?? '',
                    'carrier_type'         => $profile?->carrier_type ?? 'sole_proprietor',
                    'verification_status'  => $profile?->verification_status ?? 'incomplete',
                    'dot_verified'         => (bool) ($profile?->dot_verified ?? false),
                    'insurance_verified'   => (bool) ($profile?->insurance_verified ?? false),
                    'hazmat_endorsement'   => (bool) ($profile?->hazmat_endorsement ?? false),
                    'tanker_endorsement'   => (bool) ($profile?->tanker_endorsement ?? false),
                    'passenger_endorsement'=> (bool) ($profile?->passenger_endorsement ?? false),
                    'rating'               => (float) ($profile?->rating ?? 0),
                    'total_deliveries'     => $profile?->total_deliveries ?? 0,
                    'member_since'         => $c->created_at->format('M Y'),
                    'avatar'               => $avatar,
                    'service_types'        => $profile?->serviceTypes->map(fn($t) => [
                        'key'  => $t->key,
                        'name' => $t->name,
                        'icon' => $t->icon,
                    ])->toArray() ?? [],
                ];
            }),
        ]);
    }
}
