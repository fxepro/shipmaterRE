<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\CarrierController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PreferredCarrierController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\ShipperProfileController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// ── Public: tracking by token ──────────────────────────────────────────
Route::get('/track/{token}',  [TrackController::class, 'show']);
Route::post('/track/{token}', [TrackController::class, 'confirm']);

// ── Auth (guest) ───────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);
});

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

    // Bids
    Route::get('/shipments/{shipment}/bids',  [BidController::class, 'index']);
    Route::post('/shipments/{shipment}/bids', [BidController::class, 'store']);
    Route::put('/bids/{bid}/accept',          [BidController::class, 'accept']);
    Route::put('/bids/{bid}/withdraw',        [BidController::class, 'withdraw']);

    // Carrier: job board, offers, earnings, profile
    Route::get('/jobs',              [JobController::class, 'index']);
    Route::get('/carrier/offers',    [BidController::class, 'carrierOffers']);
    Route::get('/carrier/earnings',  [CarrierController::class, 'earnings']);
    Route::get('/carrier/profile',   [CarrierController::class, 'getProfile']);
    Route::put('/carrier/profile',   [CarrierController::class, 'updateProfile']);
    Route::get('/carriers',          [CarrierController::class, 'index']);

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

    // Contracts
    Route::get('/contracts',              [ContractController::class, 'index']);
    Route::post('/contracts',             [ContractController::class, 'store']);
    Route::put('/contracts/{contract}',   [ContractController::class, 'update']);
    Route::delete('/contracts/{contract}',[ContractController::class, 'destroy']);
});