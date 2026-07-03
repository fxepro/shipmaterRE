<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShipmentResource;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private function requireAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return null;
    }

    // GET /api/v1/admin/metrics
    public function metrics(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $total      = Shipment::count();
        $activeToday = Shipment::whereIn('status', ['in_transit', 'assigned'])
            ->whereDate('updated_at', today())
            ->count();
        $disputed   = Shipment::where('status', 'disputed')->count();
        $revenue    = Shipment::whereNotNull('platform_fee_cents')
            ->sum('platform_fee_cents') / 100;

        // Daily shipment counts for the last 14 days
        $daily = Shipment::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(13))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count]);

        return response()->json([
            'data' => [
                'total'        => $total,
                'active_today' => $activeToday,
                'disputed'     => $disputed,
                'revenue'      => number_format((float) $revenue, 2, '.', ''),
                'daily'        => $daily,
            ],
        ]);
    }

    // GET /api/v1/admin/shipments
    public function shipments(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $query = Shipment::with(['shipper', 'carrier', 'latestPing'])
            ->latest();

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where('item_description', 'ilike', "%{$q}%");
        }

        $limit     = (int) $request->input('limit', 50);
        $shipments = $query->limit($limit)->get();

        return response()->json([
            'data' => ShipmentResource::collection($shipments),
        ]);
    }

    // GET /api/v1/admin/users
    public function users(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $query = User::with('currentOrg')->latest();

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'ilike', "%{$q}%")
                    ->orWhere('email', 'ilike', "%{$q}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->limit(200)->get()->map(fn (User $u) => [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'role'       => $u->role,
            'avatar_url' => $u->avatar_url,
            'created_at' => $u->created_at?->toISOString(),
            'org'        => $u->currentOrg ? [
                'id'   => $u->currentOrg->id,
                'name' => $u->currentOrg->name,
                'type' => $u->currentOrg->type,
            ] : null,
        ]);

        return response()->json(['data' => $users]);
    }

    // GET /api/v1/admin/disputes
    public function disputes(Request $request): JsonResponse
    {
        if ($err = $this->requireAdmin($request)) return $err;

        $shipments = Shipment::with(['shipper', 'carrier'])
            ->where('status', 'disputed')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Shipment $s) => [
                'id'          => $s->id,
                'shipment_id' => $s->id,
                'item_name'   => $s->item_description,
                'reason'      => 'Disputed by ' . ($s->shipper?->name ?? 'shipper'),
                'status'      => 'open',
                'created_at'  => $s->updated_at?->toISOString(),
                'shipper'     => $s->shipper?->name,
                'carrier'     => $s->carrier?->name,
                'value'       => $s->agreed_cost,
            ]);

        return response()->json(['data' => $shipments]);
    }
}
