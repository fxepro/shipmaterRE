<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PlaidService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class PlaidController extends Controller
{
    public function __construct(private PlaidService $plaid) {}

    // ── GET /api/v1/shipper/plaid/link-token ─────────────────────────────────
    // Returns a short-lived link_token to initialise the Plaid Link widget.

    public function linkToken(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isShipper(), 403);

        if (!$this->plaid->isConfigured()) {
            return response()->json(['pending' => true, 'message' => 'Plaid not configured yet.'], 503);
        }

        try {
            $token = $this->plaid->createLinkToken($user->id, $user->email);
            return response()->json(['link_token' => $token]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ── POST /api/v1/shipper/plaid/exchange ───────────────────────────────────
    // Exchange the public_token from Plaid Link and store the bank account.

    public function exchange(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isShipper(), 403);

        $data = $request->validate([
            'public_token' => ['required', 'string'],
            'account_id'   => ['required', 'string'],
            'institution_name' => ['nullable', 'string'],
        ]);

        try {
            // 1. Exchange public token → access token
            $tokenData  = $this->plaid->exchangePublicToken($data['public_token']);
            $accessToken = $tokenData['access_token'];
            $itemId      = $tokenData['item_id'];

            // 2. Get account details (name, mask, subtype)
            $account = $this->plaid->getAccountDetails($accessToken, $data['account_id']);

            // 3. Create Stripe processor token for ACH payment method
            $stripeBankToken = $this->plaid->createStripeProcessorToken($accessToken, $data['account_id']);

            // 4. Create Stripe Customer if needed
            $customerId = $user->stripe_customer_id;
            $stripe = new StripeClient(config('services.stripe.secret'));
            if (!$customerId) {
                $customer = $stripe->customers->create([
                    'email'    => $user->email,
                    'name'     => $user->name,
                    'metadata' => ['user_id' => (string) $user->id],
                ]);
                $customerId = $customer->id;
                $user->update(['stripe_customer_id' => $customerId]);
            }

            // 5. Attach bank account to Stripe customer as a source
            // Remove old bank source first if present
            $profile = $user->shipperProfile()->firstOrCreate(['user_id' => $user->id]);
            if ($profile->stripe_bank_source_id) {
                try {
                    $stripe->customers->deleteSource($customerId, $profile->stripe_bank_source_id);
                } catch (\Exception) {}
            }

            $source = $stripe->customers->createSource($customerId, [
                'source' => $stripeBankToken,
            ]);

            // 6. Save everything to shipper profile
            $profile->update([
                'plaid_access_token'    => $accessToken,
                'plaid_item_id'         => $itemId,
                'plaid_account_id'      => $data['account_id'],
                'bank_last4'            => $account['mask'] ?? null,
                'bank_name'             => $account['name'] ?? null,
                'bank_institution_name' => $data['institution_name'] ?? null,
                'plaid_connected_at'    => now(),
                'stripe_bank_source_id' => $source->id,
            ]);

            return response()->json([
                'connected'        => true,
                'bank_name'        => $account['name'] ?? null,
                'bank_last4'       => $account['mask'] ?? null,
                'institution_name' => $data['institution_name'] ?? null,
                'subtype'          => $account['subtype'] ?? null,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ── GET /api/v1/shipper/plaid/status ─────────────────────────────────────
    // Returns the current bank connection status for the shipper.

    public function status(Request $request): JsonResponse
    {
        $user    = $request->user();
        abort_unless($user->isShipper(), 403);

        $profile = $user->shipperProfile;

        if (!$profile?->plaid_access_token) {
            return response()->json(['connected' => false]);
        }

        return response()->json([
            'connected'        => true,
            'bank_name'        => $profile->bank_name,
            'bank_last4'       => $profile->bank_last4,
            'institution_name' => $profile->bank_institution_name,
            'connected_at'     => $profile->plaid_connected_at?->toISOString(),
        ]);
    }

    // ── DELETE /api/v1/shipper/plaid/disconnect ───────────────────────────────
    // Removes the bank account connection.

    public function disconnect(Request $request): JsonResponse
    {
        $user    = $request->user();
        abort_unless($user->isShipper(), 403);

        $profile = $user->shipperProfile;
        if (!$profile) return response()->json(['disconnected' => true]);

        // Remove Stripe bank source
        if ($profile->stripe_bank_source_id && $user->stripe_customer_id) {
            try {
                $stripe = new StripeClient(config('services.stripe.secret'));
                $stripe->customers->deleteSource($user->stripe_customer_id, $profile->stripe_bank_source_id);
            } catch (\Exception) {}
        }

        $profile->update([
            'plaid_access_token'    => null,
            'plaid_item_id'         => null,
            'plaid_account_id'      => null,
            'bank_last4'            => null,
            'bank_name'             => null,
            'bank_institution_name' => null,
            'plaid_connected_at'    => null,
            'stripe_bank_source_id' => null,
        ]);

        return response()->json(['disconnected' => true]);
    }
}
