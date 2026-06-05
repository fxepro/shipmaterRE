<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificationController extends Controller
{
    // GET /api/v1/certifications — nested categories + children
    public function index(): JsonResponse
    {
        $categories = Certification::with('children')
            ->whereNull('parent_id')
            ->where('active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $categories->map(fn($cat) => [
                'id'       => $cat->id,
                'key'      => $cat->key,
                'name'     => $cat->name,
                'icon'     => $cat->icon,
                'category' => $cat->category,
                'children' => $cat->children->map(fn($c) => [
                    'id'          => $c->id,
                    'key'         => $c->key,
                    'name'        => $c->name,
                    'description' => $c->description,
                ]),
            ]),
        ]);
    }

    // PUT /api/v1/carrier/certifications
    public function sync(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isCarrier(), 403);

        $validated = $request->validate([
            'certification_keys'   => ['required', 'array'],
            'certification_keys.*' => ['string'],
        ]);

        $profile = $user->carrierProfile()->firstOrCreate(['user_id' => $user->id]);
        $ids = Certification::whereIn('key', $validated['certification_keys'])->pluck('id');
        $profile->certifications()->sync($ids);

        $profile->load('certifications');

        return response()->json([
            'data' => [
                'certification_keys' => $profile->certifications->pluck('key')->toArray(),
            ],
        ]);
    }
}
