<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireCarrierApproval
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isCarrier()) {
            $status = $user->carrierProfile?->verification_status ?? 'incomplete';

            if ($status !== 'approved') {
                return response()->json([
                    'error'               => 'Platform access requires carrier approval.',
                    'verification_status' => $status,
                    'code'                => 'carrier_not_approved',
                ], 403);
            }
        }

        return $next($request);
    }
}
