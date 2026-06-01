<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShipperProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShipperProfileController extends Controller
{
    // ── Default notification preferences ─────────────────────────────────────

    private function defaultNotifEmail(): array
    {
        return [
            'carrier_assigned' => true,
            'pickup_confirmed'  => true,
            'in_transit'        => true,
            'delivered'         => true,
            'disputed'          => true,
            'weekly_summary'    => false,
            'marketing'         => false,
        ];
    }

    private function defaultNotifSms(): array
    {
        return [
            'carrier_assigned' => false,
            'pickup_confirmed'  => true,
            'in_transit'        => false,
            'delivered'         => true,
            'disputed'          => true,
        ];
    }

    private function shape(Request $request): array
    {
        $user    = $request->user();
        $profile = $user->shipperProfile;

        return [
            'name'          => $user->name,
            'email'         => $user->email,
            'phone'         => $profile?->phone          ?? '',
            'street'        => $profile?->street         ?? '',
            'city'          => $profile?->city           ?? '',
            'state'         => $profile?->state          ?? '',
            'zip'           => $profile?->zip            ?? '',
            'country'       => $profile?->country        ?? 'United States',
            'company'       => $profile?->company_name   ?? '',
            'business_type' => $profile?->business_type  ?? 'Limited Liability Company (LLC)',
            'ein'           => $profile?->ein            ?? '',
            'industry'      => $profile?->industry       ?? 'Manufacturing',
            'website'       => $profile?->website        ?? '',
            'biz_street'    => $profile?->biz_street     ?? '',
            'biz_city'      => $profile?->biz_city       ?? '',
            'biz_state'     => $profile?->biz_state      ?? '',
            'biz_zip'       => $profile?->biz_zip        ?? '',
            'notif_email'   => $profile?->notif_email    ?? $this->defaultNotifEmail(),
            'notif_sms'     => $profile?->notif_sms      ?? $this->defaultNotifSms(),
            'member_since'  => $user->created_at->format('M Y'),
        ];
    }

    // ── GET /api/v1/shipper/profile ───────────────────────────────────────────

    public function show(Request $request): JsonResponse
    {
        abort_unless($request->user()->isShipper(), 403);
        $request->user()->load('shipperProfile');

        return response()->json(['data' => $this->shape($request)]);
    }

    // ── PUT /api/v1/shipper/profile ───────────────────────────────────────────

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isShipper(), 403);

        $validated = $request->validate([
            'name'          => ['sometimes', 'string', 'max:255'],
            'email'         => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:40'],
            'street'        => ['sometimes', 'nullable', 'string', 'max:200'],
            'city'          => ['sometimes', 'nullable', 'string', 'max:100'],
            'state'         => ['sometimes', 'nullable', 'string', 'max:50'],
            'zip'           => ['sometimes', 'nullable', 'string', 'max:20'],
            'country'       => ['sometimes', 'nullable', 'string', 'max:100'],
            'company'       => ['sometimes', 'nullable', 'string', 'max:200'],
            'business_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'ein'           => ['sometimes', 'nullable', 'string', 'max:30'],
            'industry'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'website'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'biz_street'    => ['sometimes', 'nullable', 'string', 'max:200'],
            'biz_city'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'biz_state'     => ['sometimes', 'nullable', 'string', 'max:50'],
            'biz_zip'       => ['sometimes', 'nullable', 'string', 'max:20'],
            'notif_email'   => ['sometimes', 'array'],
            'notif_sms'     => ['sometimes', 'array'],
        ]);

        // Update users table fields
        $userFields = array_intersect_key($validated, array_flip(['name', 'email']));
        if ($userFields) {
            $user->update($userFields);
        }

        // Map frontend key -> column name
        $profileData = array_diff_key($validated, array_flip(['name', 'email']));
        if (isset($profileData['company'])) {
            $profileData['company_name'] = $profileData['company'];
            unset($profileData['company']);
        }

        if ($profileData) {
            ShipperProfile::updateOrCreate(['user_id' => $user->id], $profileData);
        }

        $user->load('shipperProfile');

        return response()->json(['data' => $this->shape($request)]);
    }
}