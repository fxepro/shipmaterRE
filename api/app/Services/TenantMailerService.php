<?php

namespace App\Services;

use App\Models\PlatformTenant;
use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Symfony\Component\Mailer\Transport\SendmailTransport;
use Symfony\Component\Mime\Address;

/**
 * TenantMailerService
 *
 * Resolves a per-tenant mail configuration and builds a runtime mailer.
 * Call `mailerFor($tenant)` before dispatching a Mailable or Notification.
 *
 * Usage:
 *   $mailer = app(TenantMailerService::class)->mailerFor($tenant);
 *   if ($mailer) {
 *       $mailer->to($user)->send(new SomeMail());
 *   } else {
 *       Mail::to($user)->send(new SomeMail()); // fallback to default
 *   }
 */
class TenantMailerService
{
    /**
     * Build and return a configured Mailer for the given tenant.
     * Returns null if the tenant uses the platform default (driver = 'default' or null).
     */
    public function mailerFor(PlatformTenant $tenant): ?Mailer
    {
        $driver = $tenant->mail_driver ?? 'default';

        if ($driver === 'default' || ! $driver) {
            return null;
        }

        $config = $this->buildConfig($tenant);

        if (! $config) {
            return null;
        }

        // Dynamically register a named mailer and return it
        $name = "tenant_{$tenant->id}";

        config(["mail.mailers.{$name}" => $config]);

        return Mail::mailer($name);
    }

    /**
     * Resolve the current tenant from the request Host header and return
     * its mailer, or null if no tenant / default driver.
     */
    public function mailerFromRequest(\Illuminate\Http\Request $request): ?Mailer
    {
        $host = strtolower(explode(':', $request->header('Host', ''))[0]);

        if (! $host) return null;

        $tenant = PlatformTenant::where('custom_domain', $host)
            ->orWhere(function ($q) use ($host) {
                $parts     = explode('.', $host);
                $subdomain = count($parts) >= 3 ? $parts[0] : '';
                if ($subdomain) $q->where('subdomain', $subdomain);
            })
            ->where('status', 'active')
            ->first();

        if (! $tenant) return null;

        return $this->mailerFor($tenant);
    }

    /**
     * Build a Laravel mailer config array from the tenant's stored settings.
     */
    private function buildConfig(PlatformTenant $tenant): ?array
    {
        $fromName    = $tenant->mail_from_name    ?? config('mail.from.name');
        $fromAddress = $tenant->mail_from_address ?? config('mail.from.address');

        $base = [
            'from' => ['address' => $fromAddress, 'name' => $fromName],
        ];

        return match ($tenant->mail_driver) {
            'smtp' => array_merge($base, [
                'transport'  => 'smtp',
                'host'       => $tenant->mail_host     ?? 'smtp.mailtrap.io',
                'port'       => $tenant->mail_port     ?? 587,
                'encryption' => $tenant->mail_encryption ?? 'tls',
                'username'   => $tenant->mail_username ?? '',
                'password'   => $tenant->mail_password ?? '',
                'timeout'    => 30,
            ]),
            'postmark' => array_merge($base, [
                'transport' => 'postmark',
                'token'     => $tenant->mail_api_key ?? '',
            ]),
            'sendgrid' => array_merge($base, [
                'transport' => 'smtp',
                'host'      => 'smtp.sendgrid.net',
                'port'      => 587,
                'encryption'=> 'tls',
                'username'  => 'apikey',
                'password'  => $tenant->mail_api_key ?? '',
            ]),
            'mailgun' => array_merge($base, [
                'transport' => 'mailgun',
                'secret'    => $tenant->mail_api_key ?? '',
                'domain'    => $tenant->mail_domain  ?? '',
                'endpoint'  => $tenant->mail_region === 'eu' ? 'api.eu.mailgun.net' : 'api.mailgun.net',
            ]),
            'ses' => array_merge($base, [
                'transport' => 'ses',
                'key'       => $tenant->mail_api_key ?? config('services.ses.key'),
                'secret'    => $tenant->mail_password ?? config('services.ses.secret'),
                'region'    => $tenant->mail_region  ?? 'us-east-1',
            ]),
            default => null,
        };
    }
}
