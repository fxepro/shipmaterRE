<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShipmentResource;
use App\Models\Contract;
use App\Models\GpsPing;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShipmentController extends Controller
{
    // GET /api/v1/shipments
    // ?phase=jobs      — pre-activation (pending/bidding/offered/assigned)
    // ?phase=active    — post-activation (in_transit/delivered/disputed/cancelled)
    // ?status=x        — exact status filter
    // ?job_type=open|contracted
    // ?with_bids=1     — include bids in response (shipper offers page)
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $query = match ($user->role) {
            'shipper'  => Shipment::where('shipper_id', $user->id),
            'carrier'  => Shipment::where('carrier_id', $user->id),
            'receiver' => Shipment::where('receiver_id', $user->id),
            'admin'    => Shipment::query(),
            default    => Shipment::where('shipper_id', $user->id),
        };

        if ($request->filled('phase')) {
            match ($request->input('phase')) {
                'jobs'   => $query->whereIn('status', ['pending', 'bidding', 'offered', 'assigned']),
                'active' => $query->whereIn('status', ['in_transit', 'delivered', 'disputed', 'cancelled']),
                default  => null,
            };
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('job_type')) {
            $query->where('job_type', $request->input('job_type'));
        }

        $with = ['shipper', 'carrier.carrierProfile', 'receiver', 'latestPing'];

        if ($request->boolean('with_bids')) {
            $with[] = 'bids.carrier.carrierProfile';
        }

        $shipments = $query->with($with)->latest()->paginate(50);

        return ShipmentResource::collection($shipments);
    }

    // POST /api/v1/shipments
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'job_type'    => ['sometimes', 'in:open,contracted'],
            'contract_id' => ['required_if:job_type,contracted', 'nullable', 'exists:contracts,id'],

            'item_description'      => ['required', 'string', 'max:500'],
            'item_category'         => ['nullable', 'string', 'max:100'],
            'weight_lbs'            => ['nullable', 'numeric', 'min:0'],
            'handling_requirements' => ['nullable', 'array'],
            'special_notes'         => ['nullable', 'string', 'max:1000'],

            'pickup_address'       => ['required', 'string'],
            'pickup_city'          => ['nullable', 'string'],
            'pickup_state'         => ['nullable', 'string'],
            'pickup_lat'           => ['nullable', 'numeric'],
            'pickup_lng'           => ['nullable', 'numeric'],
            'pickup_contact_name'  => ['nullable', 'string'],
            'pickup_contact_phone' => ['nullable', 'string'],
            'pickup_date'          => ['nullable', 'date'],
            'pickup_time_window'   => ['nullable', 'string'],

            'delivery_address'       => ['required', 'string'],
            'delivery_city'          => ['nullable', 'string'],
            'delivery_state'         => ['nullable', 'string'],
            'delivery_lat'           => ['nullable', 'numeric'],
            'delivery_lng'           => ['nullable', 'numeric'],
            'delivery_contact_name'  => ['nullable', 'string'],
            'delivery_contact_phone' => ['nullable', 'string'],
            'delivery_date'          => ['nullable', 'date'],
            'delivery_time_window'   => ['nullable', 'string'],

            'distance_miles'          => ['nullable', 'numeric'],
            'estimated_duration_mins' => ['nullable', 'integer'],

            'carrier_id'  => ['nullable', 'exists:users,id'],
            'receiver_id' => ['nullable', 'exists:users,id'],
            'agreed_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        $jobType = $data['job_type'] ?? 'open';

        if ($jobType === 'contracted') {
            /** @var Contract $contract */
            $contract = Contract::findOrFail($data['contract_id']);
            abort_unless($contract->shipper_id === $user->id, 403, 'Contract does not belong to you.');
            abort_unless($contract->status === 'active', 422, 'Contract must be active to create a contracted job.');
            $data['carrier_id'] = $contract->carrier_id;
            $data['agreed_cost'] = $data['agreed_cost'] ?? $contract->rate;
            $status = 'offered';
        } else {
            $status = isset($data['carrier_id']) ? 'assigned' : 'pending';
        }

        $shipment = Shipment::create(array_merge($data, [
            'shipper_id' => $user->id,
            'job_type'   => $jobType,
            'status'     => $status,
        ]));

        $shipment->load(['shipper', 'carrier.carrierProfile', 'receiver']);

        return response()->json(['data' => new ShipmentResource($shipment)], 201);
    }

    // GET /api/v1/shipments/{shipment}
    public function show(Request $request, Shipment $shipment): JsonResponse
    {
        $this->authorizeView($request->user(), $shipment);
        $shipment->load(['shipper', 'carrier.carrierProfile', 'receiver', 'latestPing', 'bids.carrier.carrierProfile']);

        return response()->json(['data' => new ShipmentResource($shipment)]);
    }

    // POST /api/v1/shipments/{shipment}/ping  — carrier GPS update
    public function ping(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== 'admin' && $shipment->carrier_id !== $user->id) {
            abort(403, 'Only the assigned carrier can send GPS pings.');
        }

        $data = $request->validate([
            'lat'   => ['required', 'numeric'],
            'lng'   => ['required', 'numeric'],
            'speed' => ['nullable', 'numeric'],
            'eta'   => ['nullable', 'string'],
        ]);

        $ping = GpsPing::create(array_merge($data, [
            'shipment_id' => $shipment->id,
            'pinged_at'   => now(),
        ]));

        if ($shipment->status === 'assigned') {
            $shipment->update(['status' => 'in_transit']);
        }

        return response()->json(['data' => $ping]);
    }

    // PUT /api/v1/shipments/{shipment}/accept-offer  — carrier accepts contracted job
    public function acceptOffer(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === 'carrier', 403);
        abort_unless($shipment->carrier_id === $user->id, 403);
        abort_unless($shipment->status === 'offered', 422, 'This job is not awaiting acceptance.');

        $shipment->update(['status' => 'assigned']);

        return response()->json(['data' => new ShipmentResource($shipment)]);
    }

    // PUT /api/v1/shipments/{shipment}/decline-offer  — carrier declines contracted job
    public function declineOffer(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === 'carrier', 403);
        abort_unless($shipment->carrier_id === $user->id, 403);
        abort_unless($shipment->status === 'offered', 422, 'This job is not awaiting acceptance.');

        $shipment->update([
            'status'     => 'pending',
            'carrier_id' => null,
        ]);

        return response()->json(['message' => 'Job declined.']);
    }

    // PUT /api/v1/shipments/{shipment}/start  — carrier starts job (activation)
    public function start(Request $request, Shipment $shipment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === 'carrier', 403);
        abort_unless($shipment->carrier_id === $user->id, 403);
        abort_unless($shipment->status === 'assigned', 422, 'Only assigned jobs can be started.');

        $shipment->update(['status' => 'in_transit']);

        return response()->json(['data' => new ShipmentResource($shipment)]);
    }

    // ── Private ────────────────────────────────────────────────────────

    private function authorizeView(User $user, Shipment $shipment): void
    {
        $allowed = match ($user->role) {
            'admin'    => true,
            'shipper'  => $shipment->shipper_id === $user->id,
            'carrier'  => $shipment->carrier_id === $user->id,
            'receiver' => $shipment->receiver_id === $user->id,
            default    => false,
        };

        abort_unless($allowed, 403);
    }
}