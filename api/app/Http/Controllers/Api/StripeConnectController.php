<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarrierProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class StripeConnectController extends Controller
{
    private function stripe(): StripeClient
    {
        return new StripeClient(config('services.stripe.secret'));
    }

    // POST /api/v1/stripe/connect/onboard
    // Creates a Stripe Express account (or reuses existing) and returns onboarding URL
    public function onboard(Request $request): JsonResponse
    {
        $user    = $request->user();
        abort_unless($user->isCarrier(), 403);

        $profile = $user->carrierProfile;
        $stripe  = $this->stripe();

        // Create Stripe account if carrier doesn't have one yet
        if (!$profile?->stripe_account_id) {
            $account = $stripe->accounts->create([
                'type'         => 'express',
                'country'      => 'US',
                'email'        => $user->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers'     => ['requested' => true],
                ],
                'metadata' => ['carrier_id' => $user->id],
            ]);

            CarrierProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'stripe_account_id'     => $account->id,
                    'stripe_account_status' => 'pending',
                ]
            );

            $stripeAccountId = $account->id;
        } else {
            $stripeAccountId = $profile->stripe_account_id;
        }

        // Generate onboarding link
        $link = $stripe->accountLinks->create([
            'account'     => $stripeAccountId,
            'refresh_url' => config('app.frontend_url') . '/carrier/profile?tab=financial&stripe=refresh',
            'return_url'  => config('app.frontend_url') . '/carrier/profile?tab=financial&stripe=success',
            'type'        => 'account_onboarding',
        ]);

        return response()->json(['url' => $link->url]);
    }

    // GET /api/v1/stripe/connect/status
    // Check account verification status from Stripe
    public function status(Request $request): JsonResponse
    {
        $user    = $request->user();
        abort_unless($user->isCarrier(), 403);

        $profile = $user->carrierProfile;

        if (!$profile?->stripe_account_id) {
            return response()->json(['status' => 'not_connected']);
        }

        $stripe  = $this->stripe();
        $account = $stripe->accounts->retrieve($profile->stripe_account_id);

        // Map Stripe status to our status
        $status = 'pending';
        if ($account->details_submitted && $account->charges_enabled && $account->payouts_enabled) {
            $status = 'verified';
        } elseif ($account->requirements?->disabled_reason) {
            $status = 'restricted';
        }

        // Persist latest status
        $profile->update(['stripe_account_status' => $status]);

        return response()->json([
            'status'           => $status,
            'charges_enabled'  => $account->charges_enabled,
            'payouts_enabled'  => $account->payouts_enabled,
            'details_submitted'=> $account->details_submitted,
        ]);
    }

    // POST /api/v1/stripe/connect/webhook
    // Stripe sends account.updated events here
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'account.updated') {
            $account = $event->data->object;
            $profile = CarrierProfile::where('stripe_account_id', $account->id)->first();

            if ($profile) {
                $status = 'pending';
                if ($account->details_submitted && $account->charges_enabled && $account->payouts_enabled) {
                    $status = 'verified';
                } elseif ($account->requirements?->disabled_reason) {
                    $status = 'restricted';
                }
                $profile->update(['stripe_account_status' => $status]);
            }
        }

        return response()->json(['received' => true]);
    }
}
