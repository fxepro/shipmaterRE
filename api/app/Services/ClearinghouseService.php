<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * FMCSA Drug & Alcohol Clearinghouse API client.
 *
 * Registration:  https://clearinghouse.fmcsa.dot.gov  (register as C/TPA)
 * API docs:      https://clearinghouse.fmcsa.dot.gov/resource/apidoc
 *
 * Env vars required (fill in after receiving credentials):
 *   CLEARINGHOUSE_API_URL      — base URL  (default: https://clearinghouse.fmcsa.dot.gov/api/v1)
 *   CLEARINGHOUSE_API_KEY      — your C/TPA API key
 *   CLEARINGHOUSE_ORG_ID       — your registered C/TPA organisation ID
 *   CLEARINGHOUSE_WEBHOOK_SECRET — HMAC secret for webhook signature verification
 *
 * Query types:
 *   PRE_EMPLOYMENT — full query, requires driver consent, costs $1.25
 *   ANNUAL         — limited query, free, no consent required
 *
 * Flow:
 *   1. Call submitQuery() → returns query_id, status = pending_consent
 *   2. Driver goes to clearinghouse.fmcsa.dot.gov and grants consent
 *   3. FMCSA fires webhook → handleWebhookEvent() maps result
 *   4. Status becomes 'clear' or 'violations_found'
 */
class ClearinghouseService
{
    private string $baseUrl;
    private string $apiKey;
    private string $orgId;
    private string $webhookSecret;

    public function __construct()
    {
        $this->baseUrl       = config('services.clearinghouse.url',            'https://clearinghouse.fmcsa.dot.gov/api/v1');
        $this->apiKey        = config('services.clearinghouse.api_key',        '');
        $this->orgId         = config('services.clearinghouse.org_id',         '');
        $this->webhookSecret = config('services.clearinghouse.webhook_secret', '');
    }

    /**
     * Submit a pre-employment (full) query.
     * Driver must consent on the FMCSA portal — status stays pending_consent until they do.
     *
     * @param  string $cdlNumber    Driver's CDL number
     * @param  string $cdlState     Two-letter state code (e.g. "TX")
     * @param  string $driverEmail  Driver's email — FMCSA sends consent notification here
     * @return array|null           ['query_id' => string, 'status' => string, ...] or null on failure
     */
    public function submitPreEmploymentQuery(string $cdlNumber, string $cdlState, string $driverEmail): ?array
    {
        if (!$this->apiKey) {
            Log::warning('Clearinghouse: API key not configured — cannot submit query.');
            return null;
        }

        $response = Http::withHeaders([
            'X-Api-Key'    => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ])->post("{$this->baseUrl}/queries", [
            'queryType'     => 'PRE_EMPLOYMENT',
            'employerOrgId' => $this->orgId,
            'driver'        => [
                'cdlNumber' => strtoupper(trim($cdlNumber)),
                'cdlState'  => strtoupper(trim($cdlState)),
                'email'     => $driverEmail,
            ],
        ]);

        if (!$response->successful()) {
            Log::error('Clearinghouse: submitPreEmploymentQuery failed', [
                'status'   => $response->status(),
                'body'     => $response->body(),
                'cdlState' => $cdlState,
            ]);
            return null;
        }

        $data = $response->json();

        Log::info('Clearinghouse: query submitted', [
            'query_id' => $data['queryId'] ?? $data['id'] ?? null,
            'status'   => $data['status'] ?? null,
        ]);

        return $data;
    }

    /**
     * Submit an annual (limited) query — free, no consent required.
     * Returns "no violations since last full query" or "violations exist".
     */
    public function submitAnnualQuery(string $cdlNumber, string $cdlState): ?array
    {
        if (!$this->apiKey) {
            Log::warning('Clearinghouse: API key not configured — cannot submit annual query.');
            return null;
        }

        $response = Http::withHeaders([
            'X-Api-Key'    => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ])->post("{$this->baseUrl}/queries", [
            'queryType'     => 'ANNUAL',
            'employerOrgId' => $this->orgId,
            'driver'        => [
                'cdlNumber' => strtoupper(trim($cdlNumber)),
                'cdlState'  => strtoupper(trim($cdlState)),
            ],
        ]);

        if (!$response->successful()) {
            Log::error('Clearinghouse: submitAnnualQuery failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;
        }

        return $response->json();
    }

    /**
     * Poll query status from FMCSA.
     * Use this to manually check; webhooks are preferred for production.
     */
    public function getQueryStatus(string $queryId): ?array
    {
        if (!$this->apiKey) return null;

        $response = Http::withHeaders([
            'X-Api-Key' => $this->apiKey,
            'Accept'    => 'application/json',
        ])->get("{$this->baseUrl}/queries/{$queryId}");

        if (!$response->successful()) {
            Log::error('Clearinghouse: getQueryStatus failed', [
                'query_id' => $queryId,
                'status'   => $response->status(),
            ]);
            return null;
        }

        return $response->json();
    }

    /**
     * Map the raw FMCSA query result to our internal status.
     *
     * FMCSA statuses (verify against actual API docs upon registration):
     *   PENDING_CONSENT  → pending_consent
     *   IN_PROGRESS      → querying
     *   NO_VIOLATIONS    → clear
     *   VIOLATIONS_FOUND → violations_found
     */
    public function mapStatus(string $fmcsaStatus): string
    {
        return match (strtoupper($fmcsaStatus)) {
            'PENDING_CONSENT', 'CONSENT_PENDING'      => 'pending_consent',
            'IN_PROGRESS', 'PROCESSING', 'QUERYING'   => 'querying',
            'NO_VIOLATIONS', 'CLEAR', 'COMPLETED_CLEAR' => 'clear',
            'VIOLATIONS_FOUND', 'HAS_VIOLATIONS',
            'COMPLETED_VIOLATIONS'                     => 'violations_found',
            default                                    => 'querying',
        };
    }

    /**
     * Verify the HMAC-SHA256 signature on incoming webhooks.
     * FMCSA sends the signature in the X-Clearinghouse-Signature header.
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if (!$this->webhookSecret) {
            Log::warning('Clearinghouse: webhook secret not configured — skipping signature check in dev.');
            return app()->environment('local');
        }

        $expected = 'sha256=' . hash_hmac('sha256', $payload, $this->webhookSecret);
        return hash_equals($expected, $signature);
    }

    /**
     * Is the service configured (credentials present)?
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->orgId);
    }
}
