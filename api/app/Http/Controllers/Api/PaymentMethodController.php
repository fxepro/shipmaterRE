<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    // ── GET /payment-methods ──────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $methods = $request->user()
            ->paymentMethods()
            ->orderByDesc('is_default')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $methods]);
    }

    // ── POST /payment-methods ────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:card,bank'],

            // Card
            'brand'     => ['required_if:type,card', 'nullable', 'string', 'max:30'],
            'last4'     => ['required', 'string', 'size:4'],
            'exp_month' => ['required_if:type,card', 'nullable', 'string', 'size:2'],
            'exp_year'  => ['required_if:type,card', 'nullable', 'string', 'size:2'],

            // Bank
            'bank_name'    => ['required_if:type,bank', 'nullable', 'string', 'max:100'],
            'account_type' => ['required_if:type,bank', 'nullable', 'in:checking,savings'],
        ]);

        $user = $request->user();

        // First method added is automatically the default
        $isDefault = ! $user->paymentMethods()->exists();

        $method = $user->paymentMethods()->create([
            ...$validated,
            'is_default' => $isDefault,
        ]);

        return response()->json(['data' => $method], 201);
    }

    // ── DELETE /payment-methods/{paymentMethod} ───────────────────────────────
    public function destroy(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        abort_if($paymentMethod->user_id !== $request->user()->id, 403, 'Forbidden');

        $wasDefault = $paymentMethod->is_default;
        $userId     = $paymentMethod->user_id;

        $paymentMethod->delete();

        // Auto-promote next oldest method to default when the default is removed
        if ($wasDefault) {
            PaymentMethod::where('user_id', $userId)
                ->orderBy('created_at')
                ->first()
                ?->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Payment method removed']);
    }

    // ── POST /payment-methods/{paymentMethod}/default ─────────────────────────
    public function setDefault(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        abort_if($paymentMethod->user_id !== $request->user()->id, 403, 'Forbidden');

        // Clear existing default(s) for this user, then set the new one
        $request->user()->paymentMethods()->update(['is_default' => false]);
        $paymentMethod->update(['is_default' => true]);

        return response()->json(['data' => $paymentMethod->fresh()]);
    }
}
