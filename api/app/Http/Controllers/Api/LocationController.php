<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Location::where('shipper_id', $request->user()->id);

        if ($request->filled('type')) {
            $query->where(function ($q) use ($request) {
                $q->where('type', $request->type)->orWhere('type', 'both');
            });
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'ilike', "%$s%")
                  ->orWhere('city', 'ilike', "%$s%")
                  ->orWhere('address', 'ilike', "%$s%");
            });
        }

        if ($request->boolean('is_default')) {
            $query->where('is_default', true);
        }

        $locations = $query->orderByDesc('usage_count')->orderBy('name')->get();

        return response()->json(['data' => $locations]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'            => 'required|in:pickup,delivery,both',
            'name'            => 'required|string|max:200',
            'contact_name'    => 'nullable|string|max:100',
            'contact_phone'   => 'nullable|string|max:20',
            'contact_email'   => 'nullable|email|max:150',
            'address'         => 'required|string|max:255',
            'city'            => 'required|string|max:100',
            'state'           => 'required|string|max:10',
            'zip'             => 'required|string|max:20',
            'lat'             => 'nullable|numeric',
            'lng'             => 'nullable|numeric',
            'operating_hours' => 'nullable|array',
            'notes'           => 'nullable|string',
            'is_default'      => 'boolean',
        ]);

        $location = Location::create([
            ...$data,
            'shipper_id' => $request->user()->id,
            'org_id'     => $request->user()->org_id ?? null,
        ]);

        return response()->json(['data' => $location], 201);
    }

    public function update(Request $request, Location $location): JsonResponse
    {
        $this->authorise($request, $location);

        $data = $request->validate([
            'type'            => 'sometimes|in:pickup,delivery,both',
            'name'            => 'sometimes|string|max:200',
            'contact_name'    => 'nullable|string|max:100',
            'contact_phone'   => 'nullable|string|max:20',
            'contact_email'   => 'nullable|email|max:150',
            'address'         => 'sometimes|string|max:255',
            'city'            => 'sometimes|string|max:100',
            'state'           => 'sometimes|string|max:10',
            'zip'             => 'sometimes|string|max:20',
            'lat'             => 'nullable|numeric',
            'lng'             => 'nullable|numeric',
            'operating_hours' => 'nullable|array',
            'notes'           => 'nullable|string',
            'is_default'      => 'boolean',
        ]);

        $location->update($data);

        return response()->json(['data' => $location]);
    }

    public function destroy(Request $request, Location $location): JsonResponse
    {
        $this->authorise($request, $location);
        $location->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorise(Request $request, Location $location): void
    {
        abort_if($location->shipper_id !== $request->user()->id, 403);
    }
}
