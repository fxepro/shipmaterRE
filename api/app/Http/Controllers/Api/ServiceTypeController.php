<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use App\Services\ServiceTypeRules;
use Illuminate\Http\JsonResponse;

class ServiceTypeController extends Controller
{
    // GET /api/v1/service-types
    public function index(): JsonResponse
    {
        $types = ServiceType::where('active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $types->map(fn($t) => [
                'id'              => $t->id,
                'key'             => $t->key,
                'name'            => $t->name,
                'description'     => $t->description,
                'icon'            => $t->icon,
                'category'        => $t->category,
                'requires_dot'    => $t->requires_dot,
                'requires_mc'     => $t->requires_mc,
                'requires_cdl'    => $t->requires_cdl,
                'requires_hazmat' => $t->requires_hazmat,
            ]),
        ]);
    }

    // GET /api/v1/service-types/rules?types[]=freight&types[]=hazmat
    public function rules(): JsonResponse
    {
        $keys = request()->query('types', []);
        if (is_string($keys)) $keys = explode(',', $keys);

        return response()->json([
            'data' => [
                'required_fields'    => ServiceTypeRules::requiredFields($keys),
                'recommended_fields' => ServiceTypeRules::recommendedFields($keys),
                'relevant_tabs'      => ServiceTypeRules::relevantTabs($keys),
                'requires_dot'       => ServiceTypeRules::requiresDot($keys),
            ],
        ]);
    }
}
