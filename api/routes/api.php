<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\CarrierController;
use App\Http\Controllers\Api\StripeConnectController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PreferredCarrierController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\ShipperProfileController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CertificationController;
use App\Http\Controllers\Api\OrgController;
use App\Http\Controllers\Api\ServiceTypeController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// ── Public: tracking by token ──────────────────────────────────────────
Route::get('/track/{token}',  [TrackController::class, 'show']);
Route::post('/track/{token}', [TrackController::class, 'confirm']);

// ── Stripe webhook (public — Stripe signs it) ──────────────────────────
Route::post('/stripe/webhook', [StripeConnectController::class, 'webhook']);

// ── Broadcasting auth ─────────────────────────────────────────────────
Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
    return \Illuminate\Support\Facades\Broadcast::auth($request);
})->middleware('auth:sanctum');

// ── Blog (public) ─────────────────────────────────────────────────────
Route::get('/blog',        [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);

// ── Service types (public) ─────────────────────────────────────────────
Route::get('/service-types',       [ServiceTypeController::class, 'index']);
Route::get('/service-types/rules', [ServiceTypeController::class, 'rules']);

// ── Certifications (public list) ───────────────────────────────────────
Route::get('/certifications', [CertificationController::class, 'index']);

// ── Auth (public) ──────────────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// ── Authenticated ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Current user
    Route::get('/user',          [AuthController::class, 'user']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);

    // Shipments
    Route::get('/shipments',                              [ShipmentController::class, 'index']);
    Route::post('/shipments',                             [ShipmentController::class, 'store']);
    Route::get('/shipments/{shipment}',                   [ShipmentController::class, 'show']);
    Route::post('/shipments/{shipment}/ping',             [ShipmentController::class, 'ping']);
    Route::put('/shipments/{shipment}/accept-offer',      [ShipmentController::class, 'acceptOffer']);
    Route::put('/shipments/{shipment}/decline-offer',     [ShipmentController::class, 'declineOffer']);
    Route::put('/shipments/{shipment}/start',             [ShipmentController::class, 'start']);
    Route::post('/shipments/{shipment}/deliver',          [ShipmentController::class, 'deliver']);

    // Bids
    Route::get('/shipments/{shipment}/bids',  [BidController::class, 'index']);
    Route::post('/shipments/{shipment}/bids', [BidController::class, 'store']);
    Route::put('/bids/{bid}/accept',          [BidController::class, 'accept']);
    Route::put('/bids/{bid}/withdraw',        [BidController::class, 'withdraw']);

    // Carrier: job board, offers, earnings, profile, documents, vehicles
    Route::get('/jobs',                        [JobController::class, 'index']);
    Route::get('/carrier/offers',              [BidController::class, 'carrierOffers']);
    Route::get('/carrier/earnings',            [CarrierController::class, 'earnings']);
    Route::post('/carrier/payout',             [CarrierController::class, 'requestPayout']);
    Route::get('/carrier/profile',             [CarrierController::class, 'show']);
    Route::put('/carrier/profile',             [CarrierController::class, 'update']);

    // Stripe Connect
    Route::post('/stripe/connect/onboard',     [StripeConnectController::class, 'onboard']);
    Route::get('/stripe/connect/status',       [StripeConnectController::class, 'status']);

    Route::get('/carrier/documents',           [CarrierController::class, 'getDocuments']);
    Route::post('/carrier/documents',          [CarrierController::class, 'uploadDocument']);
    Route::get('/carrier/vehicles',            [CarrierController::class, 'getVehicles']);
    Route::post('/carrier/vehicles',           [CarrierController::class, 'createVehicle']);
    Route::put('/carrier/vehicles/{id}',       [CarrierController::class, 'updateVehicle']);
    Route::delete('/carrier/vehicles/{id}',    [CarrierController::class, 'deleteVehicle']);
    Route::get('/carriers',                    [CarrierController::class, 'index']);

    // Certifications
    Route::put('/carrier/certifications', [CertificationController::class, 'sync']);

    // Org / Team management
    Route::get('/org',                          [OrgController::class, 'show']);
    Route::put('/org',                          [OrgController::class, 'update']);
    Route::get('/org/members',                  [OrgController::class, 'members']);
    Route::put('/org/members/{id}',             [OrgController::class, 'updateMember']);
    Route::delete('/org/members/{id}',          [OrgController::class, 'removeMember']);
    Route::get('/org/invitations',              [OrgController::class, 'invitations']);
    Route::post('/org/invitations',             [OrgController::class, 'invite']);
    Route::delete('/org/invitations/{id}',      [OrgController::class, 'cancelInvitation']);

    // Shipper profile
    Route::get('/shipper/profile',   [ShipperProfileController::class, 'show']);
    Route::put('/shipper/profile',   [ShipperProfileController::class, 'update']);

    // Payment methods
    Route::get('/payment-methods',                          [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods',                         [PaymentMethodController::class, 'store']);
    Route::delete('/payment-methods/{paymentMethod}',       [PaymentMethodController::class, 'destroy']);
    Route::post('/payment-methods/{paymentMethod}/default', [PaymentMethodController::class, 'setDefault']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);

    // Preferred carriers
    Route::get('/preferred-carriers',                       [PreferredCarrierController::class, 'index']);
    Route::post('/preferred-carriers',                      [PreferredCarrierController::class, 'store']);
    Route::delete('/preferred-carriers/{preferredCarrier}', [PreferredCarrierController::class, 'destroy']);

    // Blog admin
    Route::get('/admin/blog',         [BlogController::class, 'adminIndex']);
    Route::post('/admin/blog',        [BlogController::class, 'store']);
    Route::put('/admin/blog/{id}',    [BlogController::class, 'update']);
    Route::delete('/admin/blog/{id}', [BlogController::class, 'destroy']);

    // Contracts
    Route::get('/contracts',              [ContractController::class, 'index']);
    Route::post('/contracts',             [ContractController::class, 'store']);
    Route::put('/contracts/{contract}',   [ContractController::class, 'update']);
    Route::delete('/contracts/{contract}',[ContractController::class, 'destroy']);
});
