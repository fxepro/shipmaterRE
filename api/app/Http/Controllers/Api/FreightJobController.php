<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\FreightJob;
use App\Models\JobStop;
use App\Models\JobStopItem;
use App\Models\Location;
use App\Services\RouteOptimizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FreightJobController extends Controller
{
    public function __construct(private RouteOptimizationService $optimizer) {}

    // ── Shipper: list jobs ────────────────────────────────────────────────────

    public function shipperIndex(Request $request): JsonResponse
    {
        $jobs = FreightJob::where('shipper_id', $request->user()->id)
            ->with(['contract', 'stops'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('contract_id'), fn($q) => $q->where('contract_id', $request->contract_id))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $jobs]);
    }

    // ── Carrier: list jobs ────────────────────────────────────────────────────

    public function carrierIndex(Request $request): JsonResponse
    {
        $jobs = FreightJob::where('carrier_id', $request->user()->id)
            ->with(['contract', 'stops', 'shipper'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->orderByDesc('posted_at')
            ->get();

        return response()->json(['data' => $jobs]);
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function show(Request $request, FreightJob $job): JsonResponse
    {
        $this->authorise($request, $job);
        $job->load(['contract', 'stops.pickupItems.deliveryStop', 'stops.deliveryItems.pickupStop', 'stops.evidence', 'shipper', 'carrier']);
        return response()->json(['data' => $job]);
    }

    // ── Create (draft) ────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'contract_id'                            => 'required|exists:contracts,id',
            'title'                                  => 'nullable|string|max:200',
            'reference_number'                       => 'nullable|string|max:100',
            'special_instructions'                   => 'nullable|string',
            'total_weight_lbs'                       => 'nullable|integer',
            'optimization_mode'                      => 'nullable|in:cluster_pickups,shortest_route',
            'stops'                                  => 'required|array|min:2',
            'stops.*.stop_type'                      => 'required|in:pickup,dropoff',
            'stops.*.sequence'                       => 'required|integer|min:1',
            'stops.*.location_id'                    => 'nullable|exists:locations,id',
            'stops.*.contact_name'                   => 'nullable|string|max:100',
            'stops.*.contact_phone'                  => 'nullable|string|max:20',
            'stops.*.address'                        => 'required|string',
            'stops.*.city'                           => 'required|string',
            'stops.*.state'                          => 'required|string|max:10',
            'stops.*.zip'                            => 'required|string|max:20',
            'stops.*.lat'                            => 'nullable|numeric',
            'stops.*.lng'                            => 'nullable|numeric',
            'stops.*.scheduled_date'                 => 'nullable|date',
            'stops.*.window_start'                   => 'nullable|date_format:H:i',
            'stops.*.window_end'                     => 'nullable|date_format:H:i',
            'stops.*.weight_lbs'                     => 'nullable|integer',
            'stops.*.special_instructions'           => 'nullable|string',
            'stops.*.items'                          => 'nullable|array',
            'stops.*.items.*.delivery_stop_sequence' => 'required_with:stops.*.items|integer',
            'stops.*.items.*.description'            => 'required_with:stops.*.items|string',
            'stops.*.items.*.quantity'               => 'nullable|integer|min:1',
            'stops.*.items.*.unit'                   => 'nullable|in:pallet,box,piece,bag,drum,crate,other',
            'stops.*.items.*.weight_lbs'             => 'nullable|integer',
            'stops.*.items.*.sku'                    => 'nullable|string|max:100',
        ]);

        $contract = Contract::findOrFail($data['contract_id']);
        abort_if($contract->shipper_id !== $request->user()->id, 403);

        return DB::transaction(function () use ($data, $contract, $request) {
            $job = FreightJob::create([
                'contract_id'          => $contract->id,
                'shipper_id'           => $request->user()->id,
                'carrier_id'           => $contract->carrier_id,
                'org_id'               => $request->user()->org_id ?? null,
                'title'                => $data['title'] ?? null,
                'reference_number'     => $data['reference_number'] ?? null,
                'special_instructions' => $data['special_instructions'] ?? null,
                'total_weight_lbs'     => $data['total_weight_lbs'] ?? null,
                'optimization_mode'    => $data['optimization_mode'] ?? $contract->optimization_mode,
                'status'               => 'draft',
            ]);

            // Create stops keyed by sequence for item linking
            $stopsBySequence = [];
            foreach ($data['stops'] as $stopData) {
                $stop = JobStop::create([
                    'freight_job_id'       => $job->id,
                    'location_id'          => $stopData['location_id'] ?? null,
                    'stop_type'            => $stopData['stop_type'],
                    'sequence'             => $stopData['sequence'],
                    'contact_name'         => $stopData['contact_name'] ?? null,
                    'contact_phone'        => $stopData['contact_phone'] ?? null,
                    'address'              => $stopData['address'],
                    'city'                 => $stopData['city'],
                    'state'                => $stopData['state'],
                    'zip'                  => $stopData['zip'],
                    'lat'                  => $stopData['lat'] ?? null,
                    'lng'                  => $stopData['lng'] ?? null,
                    'scheduled_date'       => $stopData['scheduled_date'] ?? null,
                    'window_start'         => $stopData['window_start'] ?? null,
                    'window_end'           => $stopData['window_end'] ?? null,
                    'weight_lbs'           => $stopData['weight_lbs'] ?? null,
                    'special_instructions' => $stopData['special_instructions'] ?? null,
                ]);
                $stopsBySequence[$stopData['sequence']] = $stop;

                if (!empty($stopData['location_id'])) {
                    Location::where('id', $stopData['location_id'])->increment('usage_count');
                }
            }

            // Create manifest items on pickup stops
            foreach ($data['stops'] as $stopData) {
                if ($stopData['stop_type'] !== 'pickup' || empty($stopData['items'])) continue;
                $pickupStop = $stopsBySequence[$stopData['sequence']];

                foreach ($stopData['items'] as $item) {
                    $deliveryStop = $stopsBySequence[$item['delivery_stop_sequence']] ?? null;
                    if (!$deliveryStop) continue;

                    JobStopItem::create([
                        'pickup_stop_id'   => $pickupStop->id,
                        'delivery_stop_id' => $deliveryStop->id,
                        'description'      => $item['description'],
                        'quantity'         => $item['quantity'] ?? 1,
                        'unit'             => $item['unit'] ?? 'pallet',
                        'weight_lbs'       => $item['weight_lbs'] ?? null,
                        'sku'              => $item['sku'] ?? null,
                    ]);
                }
            }

            $job->load('stops.pickupItems');
            return response()->json(['data' => $job], 201);
        });
    }

    // ── Optimise route ────────────────────────────────────────────────────────

    public function optimise(Request $request, FreightJob $job): JsonResponse
    {
        abort_if($job->shipper_id !== $request->user()->id, 403);
        abort_if($job->status !== 'draft', 422, 'Can only optimise draft jobs.');

        $stops = $job->stops()->with('deliveryItems')->get();

        $input = $stops->map(function (JobStop $stop) {
            return [
                'id'               => $stop->id,
                'lat'              => (float) $stop->lat,
                'lng'              => (float) $stop->lng,
                'type'             => $stop->stop_type,
                'required_pickups' => $stop->requiredPickupIds(),
            ];
        })->filter(fn($s) => $s['lat'] && $s['lng'])->values()->toArray();

        $result = $this->optimizer->optimize($input, $job->optimization_mode);

        foreach ($result['sequence'] as $position => $stopId) {
            JobStop::where('id', $stopId)->update(['optimized_sequence' => $position + 1]);
        }

        $job->update([
            'route_distance_miles'   => $result['distance_miles'],
            'route_duration_minutes' => $result['duration_minutes'],
            'route_optimized_at'     => now(),
            'route_snapshot'         => $result,
        ]);

        $job->load('stops');
        return response()->json(['data' => $job]);
    }

    // ── Post (send to carrier) ────────────────────────────────────────────────

    public function post(Request $request, FreightJob $job): JsonResponse
    {
        abort_if($job->shipper_id !== $request->user()->id, 403);
        abort_if($job->status !== 'draft', 422, 'Job is not in draft status.');

        $job->update([
            'status'    => 'posted',
            'posted_at' => now(),
        ]);

        return response()->json(['data' => $job]);
    }

    // ── Carrier: update stop status ───────────────────────────────────────────

    public function updateStop(Request $request, FreightJob $job, JobStop $stop): JsonResponse
    {
        abort_if($job->carrier_id !== $request->user()->id, 403);
        abort_if($stop->freight_job_id !== $job->id, 404);

        $data = $request->validate([
            'status'        => 'required|in:en_route,arrived,completed',
            'carrier_notes' => 'nullable|string',
        ]);

        $timestamps = [
            'en_route'  => 'en_route_at',
            'arrived'   => 'arrived_at',
            'completed' => 'completed_at',
        ];

        $stop->update([
            'status'                      => $data['status'],
            $timestamps[$data['status']]  => now(),
            'carrier_notes'               => $data['carrier_notes'] ?? $stop->carrier_notes,
        ]);

        if ($data['status'] === 'completed') {
            $allDone = $job->stops()->where('status', '!=', 'completed')->doesntExist();
            if ($allDone) {
                $job->update(['status' => 'completed']);
            } elseif ($job->status === 'posted') {
                $job->update(['status' => 'in_progress']);
            }
        }

        return response()->json(['data' => $stop]);
    }

    private function authorise(Request $request, FreightJob $job): void
    {
        $uid = $request->user()->id;
        abort_if($job->shipper_id !== $uid && $job->carrier_id !== $uid, 403);
    }
}
