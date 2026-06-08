<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PlaidService
{
    private string $clientId;
    private string $secret;
    private string $baseUrl;

    public function __construct()
    {
        $env           = config('services.plaid.env', 'sandbox');
        $this->clientId = config('services.plaid.client_id', '');
        $this->secret   = config('services.plaid.secret', '');
        $this->baseUrl  = match ($env) {
            'production'  => 'https://production.plaid.com',
            'development' => 'https://development.plaid.com',
            default       => 'https://sandbox.plaid.com',
        };
    }

    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->secret);
    }

    private function post(string $path, array $body): array
    {
        $response = Http::post("{$this->baseUrl}{$path}", array_merge([
            'client_id' => $this->clientId,
            'secret'    => $this->secret,
        ], $body));

        if ($response->failed()) {
            throw new \RuntimeException("Plaid API error [{$path}]: " . $response->body());
        }

        return $response->json();
    }

    /**
     * Create a link_token to initialise Plaid Link on the frontend.
     */
    public function createLinkToken(int $userId, string $userEmail): string
    {
        $data = $this->post('/link/token/create', [
            'user'          => ['client_user_id' => (string) $userId],
            'client_name'   => 'Shipmater',
            'products'      => ['auth'],
            'country_codes' => ['US'],
            'language'      => 'en',
            'webhook'       => config('app.url') . '/api/v1/plaid/webhook',
        ]);

        return $data['link_token'];
    }

    /**
     * Exchange a public_token (from Plaid Link onSuccess) for a permanent access_token.
     */
    public function exchangePublicToken(string $publicToken): array
    {
        return $this->post('/item/public_token/exchange', [
            'public_token' => $publicToken,
        ]);
        // returns: { access_token, item_id }
    }

    /**
     * Get auth (account + routing numbers) for the connected item.
     */
    public function getAuth(string $accessToken): array
    {
        return $this->post('/auth/get', [
            'access_token' => $accessToken,
        ]);
        // returns: { accounts, numbers: { ach: [...] } }
    }

    /**
     * Create a Stripe processor token from a Plaid account.
     * This token can be used with Stripe to create an ACH payment method.
     */
    public function createStripeProcessorToken(string $accessToken, string $accountId): string
    {
        $data = $this->post('/processor/stripe/bank_account_token/create', [
            'access_token' => $accessToken,
            'account_id'   => $accountId,
        ]);

        return $data['stripe_bank_account_token'];
    }

    /**
     * Get account details (name, mask/last4, subtype) for a given account_id.
     */
    public function getAccountDetails(string $accessToken, string $accountId): ?array
    {
        $auth = $this->getAuth($accessToken);

        $account = collect($auth['accounts'] ?? [])->firstWhere('account_id', $accountId);
        if (!$account) return null;

        $achNumbers = collect($auth['numbers']['ach'] ?? [])->firstWhere('account_id', $accountId);

        return [
            'account_id'       => $accountId,
            'name'             => $account['name'],
            'official_name'    => $account['official_name'] ?? null,
            'subtype'          => $account['subtype'],   // checking | savings
            'mask'             => $account['mask'],       // last 4
            'institution_name' => $auth['item']['institution_id'] ?? null,
        ];
    }
}
