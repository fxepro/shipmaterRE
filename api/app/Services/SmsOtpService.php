<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Phone OTP via Twilio Verify when configured.
 * Local/dev without Twilio: stores OTP in cache and returns the code
 * (same pattern as MAIL_MAILER=log — not production verification).
 */
class SmsOtpService
{
    private const TTL_SECONDS = 600; // 10 minutes
    private const MAX_ATTEMPTS = 5;

    public function send(string $phoneE164, int $userId): array
    {
        $phone = $this->normalizeE164($phoneE164);
        $cacheKey = $this->cacheKey($userId, $phone);

        $throttleKey = "sms_otp_throttle:{$userId}";
        if (Cache::has($throttleKey)) {
            throw new RuntimeException('Please wait before requesting another code.');
        }
        Cache::put($throttleKey, true, 60);

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');
        $verifySid = config('services.twilio.verify_sid');

        if ($sid && $token && $verifySid) {
            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://verify.twilio.com/v2/Services/{$verifySid}/Verifications", [
                    'To'   => $phone,
                    'Channel' => 'sms',
                ]);

            if (!$response->successful()) {
                Log::error('Twilio Verify send failed', ['body' => $response->json()]);
                throw new RuntimeException('Failed to send verification SMS. Try again later.');
            }

            Cache::put($cacheKey, [
                'provider' => 'twilio',
                'phone'    => $phone,
                'attempts' => 0,
            ], self::TTL_SECONDS);

            return [
                'message' => 'Verification code sent.',
                'phone'   => $this->mask($phone),
            ];
        }

        if ($sid && $token && $from) {
            $code = (string) random_int(100000, 999999);
            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'To'   => $phone,
                    'From' => $from,
                    'Body' => "Your Shipmater verification code is {$code}. Expires in 10 minutes.",
                ]);

            if (!$response->successful()) {
                Log::error('Twilio SMS send failed', ['body' => $response->json()]);
                throw new RuntimeException('Failed to send verification SMS. Try again later.');
            }

            Cache::put($cacheKey, [
                'provider' => 'twilio_sms',
                'phone'    => $phone,
                'code'     => $code,
                'attempts' => 0,
            ], self::TTL_SECONDS);

            return [
                'message' => 'Verification code sent.',
                'phone'   => $this->mask($phone),
            ];
        }

        // Local / no Twilio — never pretend SMS was delivered.
        if (app()->environment('production') || config('app.env') === 'production') {
            throw new RuntimeException('SMS provider is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SID (or TWILIO_FROM) on the API.');
        }

        $code = (string) random_int(100000, 999999);
        Cache::put($cacheKey, [
            'provider' => 'local',
            'phone'    => $phone,
            'code'     => $code,
            'attempts' => 0,
        ], self::TTL_SECONDS);

        Log::warning('[SmsOtpService] Local OTP only — Twilio not configured', [
            'user_id' => $userId,
            'phone'   => $phone,
            'code'    => $code,
        ]);

        return [
            'message'  => 'Dev only: SMS not configured. Use the on-screen code.',
            'phone'    => $this->mask($phone),
            'dev_code' => $code,
        ];
    }

    public function confirm(string $phoneE164, int $userId, string $code): bool
    {
        $phone = $this->normalizeE164($phoneE164);
        $cacheKey = $this->cacheKey($userId, $phone);
        $payload = Cache::get($cacheKey);

        if (!$payload || ($payload['phone'] ?? null) !== $phone) {
            return false;
        }

        $attempts = (int) ($payload['attempts'] ?? 0);
        if ($attempts >= self::MAX_ATTEMPTS) {
            Cache::forget($cacheKey);
            throw new RuntimeException('Too many attempts. Request a new code.');
        }

        $payload['attempts'] = $attempts + 1;
        Cache::put($cacheKey, $payload, self::TTL_SECONDS);

        $provider = $payload['provider'] ?? 'local';

        if ($provider === 'twilio') {
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $verifySid = config('services.twilio.verify_sid');

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://verify.twilio.com/v2/Services/{$verifySid}/VerificationCheck", [
                    'To'   => $phone,
                    'Code' => $code,
                ]);

            $ok = $response->successful() && ($response->json('status') === 'approved');
            if ($ok) {
                Cache::forget($cacheKey);
            }
            return $ok;
        }

        $expected = (string) ($payload['code'] ?? '');
        if (!hash_equals($expected, trim($code))) {
            return false;
        }

        Cache::forget($cacheKey);
        return true;
    }

    public function normalizeE164(string $phone, ?string $countryCode = null): string
    {
        $trimmed = trim($phone);
        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';

        // Already includes country digits via leading +
        if (str_starts_with($trimmed, '+')) {
            if (strlen($digits) < 10 || strlen($digits) > 15) {
                throw new RuntimeException('Enter a valid phone number including country code.');
            }

            return '+'.$digits;
        }

        // Strip leading 0 from national numbers (common internationally)
        $national = ltrim($digits, '0');

        $dial = $this->dialDigitsForCountry($countryCode);
        if ($dial !== '') {
            // Avoid double-prefix if user pasted full international digits
            if (! str_starts_with($national, $dial)) {
                $national = $dial.$national;
            }
            if (strlen($national) < 10 || strlen($national) > 15) {
                throw new RuntimeException('Enter a valid phone number for the selected country.');
            }

            return '+'.$national;
        }

        // Legacy fallback: 10-digit → +1 (US/CA)
        if (strlen($digits) === 10) {
            return '+1'.$digits;
        }
        if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
            return '+'.$digits;
        }
        if (strlen($digits) < 10 || strlen($digits) > 15) {
            throw new RuntimeException('Enter a valid phone number including country code.');
        }

        return '+'.$digits;
    }

    /** ISO country → dial digits without +. */
    private function dialDigitsForCountry(?string $countryCode): string
    {
        if (! $countryCode) {
            return '';
        }
        static $map = [
            'US' => '1', 'CA' => '1', 'MX' => '52',
            'GB' => '44', 'DE' => '49', 'FR' => '33', 'NL' => '31', 'PL' => '48',
            'ES' => '34', 'IT' => '39', 'SE' => '46', 'NO' => '47', 'CH' => '41',
            'AT' => '43', 'BE' => '32', 'DK' => '45', 'FI' => '358', 'PT' => '351',
            'CZ' => '420', 'RO' => '40', 'HU' => '36', 'UA' => '380', 'TR' => '90',
            'AU' => '61', 'NZ' => '64', 'IN' => '91', 'JP' => '81', 'CN' => '86',
            'SG' => '65', 'AE' => '971', 'SA' => '966', 'IL' => '972', 'KR' => '82',
            'ID' => '62', 'PH' => '63', 'MY' => '60', 'TH' => '66', 'VN' => '84',
            'PK' => '92', 'BD' => '880',
            'BR' => '55', 'AR' => '54', 'CL' => '56', 'CO' => '57', 'PE' => '51',
            'VE' => '58', 'GT' => '502',
            'ZA' => '27', 'NG' => '234', 'EG' => '20', 'KE' => '254', 'MA' => '212',
            'GH' => '233', 'ET' => '251',
        ];

        return $map[strtoupper($countryCode)] ?? '';
    }

    private function cacheKey(int $userId, string $phone): string
    {
        return "sms_otp:{$userId}:".sha1($phone);
    }

    private function mask(string $phone): string
    {
        $len = strlen($phone);
        if ($len < 6) return $phone;
        return substr($phone, 0, 3).str_repeat('*', max(0, $len - 7)).substr($phone, -4);
    }
}
