<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarrierProfile;
use App\Models\CarrierVerification;
use App\Services\CheckrService;
use App\Services\FmcsaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarrierVerificationController extends Controller
{
    public function __construct(
        private FmcsaService  $fmcsa,
        private CheckrService $checkr,
    ) {}

    // ── POST /api/v1/carrier/verify/dot ──────────────────────────────────────
    // Lookup a USDOT number against the live FMCSA SAFER database.
    // Saves dot_verified on the carrier profile if result is positive.

    public function verifyDot(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $validated = $request->validate([
            'dot_number' => ['required', 'string', 'max:20'],
        ]);

        $result = $this->fmcsa->lookupByDot($validated['dot_number']);

        if (!$result) {
            return response()->json([
                'error' => 'DOT number not found in the FMCSA SAFER database. Double-check the number and try again.',
            ], 404);
        }

        $profile = $request->user()->carrierProfile()->firstOrCreate(
            ['user_id' => $request->user()->id]
        );

        // Update profile with verified status and auto-fill legal name if not set
        $profile->update([
            'dot_number'          => preg_replace('/\D/', '', $validated['dot_number']),
            'usdot_number'        => preg_replace('/\D/', '', $validated['dot_number']),
            'dot_verified'        => $result['allowed_to_operate'],
            'company_name'        => $profile->company_name ?: ($result['legal_name'] ?? null),
            'last_verification_at'=> now(),
        ]);

        // Upsert verification record
        CarrierVerification::updateOrCreate(
            [
                'carrier_profile_id' => $profile->id,
                'check_type'         => 'fmcsa',
            ],
            [
                'status'      => $result['allowed_to_operate'] ? 'passed' : 'failed',
                'external_id' => $result['dot_number'],
                'result_data' => $result,
                'expires_at'  => now()->addDays(90),
            ]
        );

        return response()->json([
            'data'     => $result,
            'verified' => $result['allowed_to_operate'],
            'message'  => $result['allowed_to_operate']
                ? 'DOT verified — carrier is authorized to operate.'
                : 'DOT number found but this carrier is NOT currently authorized to operate.',
        ]);
    }

    // ── POST /api/v1/carrier/verify/mc ───────────────────────────────────────
    // Lookup an MC (motor carrier docket) number. Does not set dot_verified
    // but returns the FMCSA record for the carrier to review.

    public function verifyMc(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $validated = $request->validate([
            'mc_number' => ['required', 'string', 'max:30'],
        ]);

        $result = $this->fmcsa->lookupByMc($validated['mc_number']);

        if (!$result) {
            return response()->json([
                'error' => 'MC number not found in the FMCSA database.',
            ], 404);
        }

        $profile = $request->user()->carrierProfile()->firstOrCreate(
            ['user_id' => $request->user()->id]
        );

        $profile->update([
            'mc_number'           => preg_replace('/\D/', '', $validated['mc_number']),
            'mc_verified'         => $result['allowed_to_operate'],
            'last_verification_at'=> now(),
        ]);

        CarrierVerification::updateOrCreate(
            [
                'carrier_profile_id' => $profile->id,
                'check_type'         => 'mc',
            ],
            [
                'status'      => $result['allowed_to_operate'] ? 'passed' : 'failed',
                'external_id' => preg_replace('/\D/', '', $validated['mc_number']),
                'result_data' => $result,
                'expires_at'  => now()->addDays(90),
            ]
        );

        return response()->json([
            'data'     => $result,
            'verified' => $result['allowed_to_operate'],
            'message'  => $result['allowed_to_operate']
                ? 'MC number verified — carrier has active operating authority.'
                : 'MC number found but operating authority is NOT active.',
        ]);
    }

    // ── POST /api/v1/carrier/background-check ────────────────────────────────
    // Initiate a Checkr background check via hosted invitation.
    // Candidate enters their own SSN on Checkr's secure form — we never see it.

    public function initiateBackgroundCheck(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $user    = $request->user();
        $profile = $user->carrierProfile;

        if (!$profile || !$user->name || !$profile->date_of_birth) {
            return response()->json([
                'error' => 'Complete your name and date of birth in the Personal tab before running a background check.',
            ], 422);
        }

        // Reuse existing candidate or create a new one
        $candidateId = $profile->checkr_candidate_id;

        if (!$candidateId) {
            $parts     = explode(' ', trim($user->name), 2);
            $candidate = $this->checkr->createCandidate([
                'first_name' => $parts[0],
                'last_name'  => $parts[1] ?? '',
                'email'      => $user->email,
                'dob'        => $profile->date_of_birth->format('Y-m-d'),
            ]);

            if (!$candidate) {
                return response()->json(['error' => 'Failed to create Checkr candidate. Try again.'], 500);
            }

            $candidateId = $candidate['id'];
            $profile->update(['checkr_candidate_id' => $candidateId]);
        }

        // Create a hosted invitation — candidate fills SSN on Checkr's own form
        $invitation = $this->checkr->createInvitation($candidateId, 'driver_pro');

        if (!$invitation) {
            return response()->json(['error' => 'Failed to create background check invitation. Try again.'], 500);
        }

        $invitationUrl = $invitation['invitation_url'];

        $profile->update(['background_check_status' => 'invitation_sent']);

        CarrierVerification::updateOrCreate(
            ['carrier_profile_id' => $profile->id, 'check_type' => 'background'],
            [
                'status'      => 'pending',
                'external_id' => $candidateId,
                'result_data' => ['invitation_url' => $invitationUrl, 'invitation_id' => $invitation['id']],
            ]
        );

        return response()->json([
            'invitation_url' => $invitationUrl,
            'message'        => 'Background check initiated. Complete the secure form — results in 3–5 business days.',
        ]);
    }

    // ── POST /api/v1/checkr/webhook ───────────────────────────────────────────
    // Receives Checkr events (public route, signed with HMAC-SHA256).

    public function checkrWebhook(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $signature = $request->header('X-Checkr-Signature') ?? '';

        if (!$this->checkr->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = $request->json()->all();
        $type  = $event['type'] ?? '';
        $obj   = $event['data']['object'] ?? [];

        if ($type === 'report.completed') {
            $candidateId = $obj['candidate_id'] ?? null;
            $reportId    = $obj['id'] ?? null;
            $result      = $obj['result'] ?? 'consider'; // clear | consider | suspended

            $profile = CarrierProfile::where('checkr_candidate_id', $candidateId)->first();

            if ($profile) {
                // Map Checkr result → platform verification_status
                $verificationStatus = match ($result) {
                    'clear'     => 'approved',       // full platform access
                    'suspended' => 'rejected',        // blocked
                    default     => 'pending_review',  // consider → admin reviews
                };

                $profile->update([
                    'checkr_report_id'               => $reportId,
                    'background_check_status'        => $result,
                    'verification_status'            => $verificationStatus,
                    'verification_status_updated_at' => now(),
                ]);

                CarrierVerification::updateOrCreate(
                    ['carrier_profile_id' => $profile->id, 'check_type' => 'background'],
                    [
                        'status'      => match ($result) {
                            'clear'     => 'passed',
                            'suspended' => 'failed',
                            default     => 'manual_review',
                        },
                        'external_id' => $reportId,
                        'result_data' => [
                            'result'          => $result,
                            'report_id'       => $reportId,
                            'turnaround_time' => $obj['turnaround_time'] ?? null,
                            'completed_at'    => $obj['completed_at'] ?? null,
                        ],
                    ]
                );
            }
        }

        return response()->json(['received' => true]);
    }

    // ── GET /api/v1/carrier/verifications ────────────────────────────────────
    // Returns all verification records for the authenticated carrier.

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isCarrier(), 403);

        $profile = $request->user()->carrierProfile;
        if (!$profile) return response()->json(['data' => []]);

        $verifications = $profile->verifications()
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn($v) => [
                'check_type'  => $v->check_type,
                'status'      => $v->status,
                'external_id' => $v->external_id,
                'expires_at'  => $v->expires_at?->toDateString(),
                'updated_at'  => $v->updated_at->toISOString(),
            ]);

        return response()->json(['data' => $verifications]);
    }
}
