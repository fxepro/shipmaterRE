<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarrierController extends Controller
{
    // GET /api/v1/carrier/earnings
    public function earnings(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === 'carrier', 403);

        $shipments = Shipment::where('carrier_id', $user->id)
            ->whereIn('status', ['delivered', 'in_transit', 'assigned'])
            ->get(['id', 'status', 'agreed_cost', 'pickup_city', 'pickup_state',
                   'delivery_city', 'delivery_state', 'distance_miles', 'delivered_at']);

        $delivered       = $shipments->where('status', 'delivered');
        $pendingEscrow   = $shipments->whereIn('status', ['in_transit', 'assigned']);
        $totalPaid       = $delivered->sum('agreed_cost');
        $pendingAmount   = $pendingEscrow->sum('agreed_cost');

        return response()->json([
            'data' => [
                'total_paid'      => (float) $totalPaid,
                'pending_escrow'  => (float) $pendingAmount,
                'shipments'       => $shipments->map(fn ($s) => [
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

    // ── Carrier profile shape helper ──────────────────────────────────────────

    private function profileShape(\App\Models\User $user): array
    {
        $profile = $user->carrierProfile;
        $parts   = explode(' ', $user->name);
        $avatar  = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));

        return [
            'name'                    => $user->name,
            'email'                   => $user->email,
            'avatar'                  => $avatar,
            'dot_number'              => $profile?->dot_number              ?? '',
            'mc_number'               => $profile?->mc_number               ?? '',
            'company_name'            => $profile?->company_name            ?? '',
            'phone'                   => $profile?->phone                   ?? '',
            'dot_verified'            => (bool) ($profile?->dot_verified    ?? false),
            'insurance_verified'      => (bool) ($profile?->insurance_verified ?? false),
            'background_check_status' => $profile?->background_check_status ?? 'not_started',
            'rating'                  => (float) ($profile?->rating         ?? 0),
            'total_deliveries'        => $profile?->total_deliveries        ?? 0,
            'member_since'            => $user->created_at->format('M Y'),
        ];
    }

    // GET /api/v1/carrier/profile
    public function getProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->role === 'carrier', 403);
        $user->load('carrierProfile');

        return response()->json(['data' => $this->profileShape($user)]);
    }

    // PUT /api/v1/carrier/profile
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->role === 'carrier', 403);

        $validated = $request->validate([
            'name'         => ['sometimes', 'string', 'max:255'],
            'dot_number'   => ['sometimes', 'nullable', 'string', 'max:20'],
            'mc_number'    => ['sometimes', 'nullable', 'string', 'max:30'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:200'],
            'phone'        => ['sometimes', 'nullable', 'string', 'max:40'],
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
            unset($validated['name']);
        }

        if ($validated) {
            $user->carrierProfile()->updateOrCreate(['user_id' => $user->id], $validated);
        }

        $user->load('carrierProfile');

        return response()->json(['data' => $this->profileShape($user)]);
    }

    // GET /api/v1/carriers  (list carriers; optional ?dot= filter for lookup)
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'carrier')->with('carrierProfile');

        if ($dot = $request->query('dot')) {
            $query->whereHas('carrierProfile', fn ($q) => $q->where('dot_number', $dot));
        }

        $carriers = $query->get();

        return response()->json([
            'data' => $carriers->map(function ($c) {
                $profile = $c->carrierProfile;
                $parts   = explode(' ', $c->name);
                $avatar  = strtoupper(
                    substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : '')
                );

                return [
                    'id'                 => $c->id,
                    'name'               => $c->name,
                    'email'              => $c->email,
                    'company_name'       => $profile?->company_name ?? '',
                    'dot_number'         => $profile?->dot_number ?? '',
                    'mc_number'          => $profile?->mc_number ?? '',
                    'phone'              => $profile?->phone ?? '',
                    'dot_verified'       => (bool) ($profile?->dot_verified ?? false),
                    'insurance_verified' => (bool) ($profile?->insurance_verified ?? false),
                    'rating'             => (float) ($profile?->rating ?? 5.0),
                    'reviews'            => $profile?->total_deliveries ?? 0,
                    'avatar'             => $avatar,
                ];
            }),
        ]);
    }
}
