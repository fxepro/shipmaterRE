<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckrService
{
    private string $baseUrl = 'https://api.checkr.com/v1';

    private function http()
    {
        return Http::timeout(15)
            ->withBasicAuth(config('services.checkr.key'), '')
            ->accept('application/json');
    }

    // ── Create a candidate ───────────────────────────────────────────────────
    // Checkr needs: first_name, last_name, email, dob (YYYY-MM-DD)
    // SSN is collected directly by Checkr on their secure hosted form.

    public function createCandidate(array $data): ?array
    {
        $response = $this->http()->post("{$this->baseUrl}/candidates", $data);

        if (!$response->successful()) {
            Log::error('[Checkr] Create candidate failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;
        }

        return $response->json();
    }

    // ── Create an invitation ─────────────────────────────────────────────────
    // Returns invitation_url — candidate opens it and enters their own SSN.
    // Invitation is valid for 7 days.

    public function createInvitation(string $candidateId, string $package = 'driver_pro'): ?array
    {
        $response = $this->http()->post("{$this->baseUrl}/invitations", [
            'candidate_id'   => $candidateId,
            'package'        => $package,
            'work_locations' => [['country' => 'US']],
            'payment_type'   => 'candidate', // carrier pays Checkr directly — platform has zero cost
        ]);

        if (!$response->successful()) {
            Log::error('[Checkr] Create invitation failed', [
                'status'       => $response->status(),
                'candidate_id' => $candidateId,
                'body'         => $response->body(),
            ]);
            return null;
        }

        return $response->json();
    }

    // ── Fetch a report ───────────────────────────────────────────────────────

    public function getReport(string $reportId): ?array
    {
        $response = $this->http()->get("{$this->baseUrl}/reports/{$reportId}");

        if (!$response->successful()) {
            Log::error('[Checkr] Get report failed', [
                'report_id' => $reportId,
                'status'    => $response->status(),
            ]);
            return null;
        }

        return $response->json();
    }

    // ── Verify Checkr webhook signature ──────────────────────────────────────
    // Checkr signs the raw payload with HMAC-SHA256 using the webhook secret.

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $secret = config('services.checkr.webhook_secret');
        if (!$secret) return false;

        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }
}
