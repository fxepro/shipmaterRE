<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bid;
use App\Models\Shipment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipperPaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    // ── POST /api/v1/bids/{bid}/payment-intent ────────────────────────────────
    // Step 1: Shipper requests a PaymentIntent before accepting a bid.
    // Returns client_secret for Stripe.js to confirm (authorize) the charge.
    // The bid is NOT accepted yet — acceptance happens after authorization.

    public function createIntent(Request $request, Bid $bid): JsonResponse
    {
        $user     = $request->user();
        $shipment = $bid->shipment;

        abort_unless($user->isShipper(), 403);
        abort_unless($shipment->shipper_id === $user->id, 403);
        abort_unless($bid->status === 'pending', 422, 'Bid is no longer available.');
        abort_unless($shipment->status === 'bidding' || $shipment->status === 'pending', 422, 'Shipment is not open for payment.');

        // If a PaymentIntent already exists for this shipment (e.g. shipper re-opened the modal),
        // return the existing one so we don't create duplicates.
        if ($shipment->payment_intent_id && $shipment->payment_status === 'authorized') {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            try {
                $intent = $stripe->paymentIntents->retrieve($shipment->payment_intent_id);
                if (in_array($intent->status, ['requires_payment_method', 'requires_confirmation', 'requires_action', 'requires_capture'])) {
                    return response()->json([
                        'client_secret'     => $intent->client_secret,
                        'payment_intent_id' => $intent->id,
                        'amount_cents'      => $intent->amount,
                        'fee_cents'         => $shipment->platform_fee_cents,
                    ]);
                }
            } catch (\Exception) {
                // Fall through to create a new one
            }
        }

        // Temporarily set agreed_cost from the bid amount so PaymentService can read it
        $shipment->agreed_cost = $bid->amount;

        $result = $this->payments->createFreightIntent($shipment, $user);

        return response()->json($result);
    }

    // ── PUT /api/v1/bids/{bid}/accept ─────────────────────────────────────────
    // Step 2: After Stripe authorizes the card, shipper confirms bid acceptance.
    // Verifies the PaymentIntent is in requires_capture state.

    public function accept(Request $request, Bid $bid): JsonResponse
    {
        $user     = $request->user();
        $shipment = $bid->shipment;

        abort_unless($user->isShipper(), 403);
        abort_unless($shipment->shipper_id === $user->id, 403);
        abort_unless($bid->status === 'pending', 422, 'This bid can no longer be accepted.');

        $data = $request->validate([
            'payment_intent_id' => ['required', 'string'],
        ]);

        // Verify the PaymentIntent is authorized (requires_capture) before assigning
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        try {
            $intent = $stripe->paymentIntents->retrieve($data['payment_intent_id']);
            abort_unless(
                in_array($intent->status, ['requires_capture', 'succeeded']),
                422,
                'Payment has not been authorized yet. Please complete payment first.'
            );
        } catch (\Exception $e) {
            abort(422, 'Could not verify payment: ' . $e->getMessage());
        }

        // Accept the bid and assign the carrier
        $bid->update(['status' => 'accepted']);
        $shipment->bids()->where('id', '!=', $bid->id)->update(['status' => 'rejected']);
        $shipment->update([
            'carrier_id'         => $bid->carrier_id,
            'agreed_cost'        => $bid->amount,
            'status'             => 'assigned',
            'payment_intent_id'  => $data['payment_intent_id'],
            'payment_status'     => 'authorized',
        ]);

        return response()->json([
            'message'    => 'Bid accepted and payment authorized.',
            'shipment_id' => $shipment->id,
        ]);
    }

    // ── POST /api/v1/shipper/pay/{shipment} ───────────────────────────────────
    // For shipments that already have an agreed_cost but no payment yet
    // (e.g. contracted jobs, direct offers). Creates and returns a PaymentIntent.

    public function payShipment(Request $request, Shipment $shipment): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isShipper(), 403);
        abort_unless($shipment->shipper_id === $user->id, 403);
        abort_unless($shipment->agreed_cost > 0, 422, 'No agreed cost on this shipment.');
        abort_unless(in_array($shipment->payment_status, ['unpaid', null]), 422, 'Payment already exists.');

        $result = $this->payments->createFreightIntent($shipment, $user);

        return response()->json($result);
    }
}
