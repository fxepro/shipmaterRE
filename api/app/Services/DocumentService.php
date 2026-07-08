<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\FreightJob;
use App\Models\Organization;
use App\Models\PlatformTenant;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class DocumentService
{
    // ── Public entry points ────────────────────────────────────────────────────

    /**
     * Rate Confirmation PDF for a FreightJob.
     * Returns a Laravel Response streaming the PDF inline / as download.
     */
    public function rateConfirmation(FreightJob $job, bool $download = false): Response
    {
        $job->load([
            'shipper.org.platformTenant',
            'shipper.shipperProfile',
            'carrier.carrierProfile',
            'stops.location',
        ]);

        $broker  = $this->brokerIdentity($job->shipper);
        $carrier = $this->carrierIdentity($job->carrier);
        $stops   = $job->stops;

        $breakdown = $job->cost_breakdown ?? [];
        $totalCents = $job->payment_amount_cents ?? 0;

        $data = [
            'broker'    => $broker,
            'carrier'   => $carrier,
            'job'       => $job,
            'stops'     => $stops,
            'breakdown' => $breakdown,
            'total'     => $totalCents / 100,
            'generated' => now()->format('M j, Y'),
        ];

        $filename = 'rate-confirmation-' . ($job->reference_number ?? $job->id) . '.pdf';
        return $this->render('documents.rate_confirmation', $data, $broker, $filename, $download);
    }

    /**
     * Carrier Agreement PDF for a Contract.
     */
    public function carrierAgreement(Contract $contract, bool $download = false): Response
    {
        $contract->load([
            'shipper.org.platformTenant',
            'shipper.shipperProfile',
            'carrier.carrierProfile',
        ]);

        $broker  = $this->brokerIdentity($contract->shipper);
        $carrier = $this->carrierIdentity($contract->carrier);

        $data = [
            'broker'    => $broker,
            'carrier'   => $carrier,
            'contract'  => $contract,
            'generated' => now()->format('M j, Y'),
        ];

        $filename = 'carrier-agreement-' . $contract->id . '.pdf';
        return $this->render('documents.carrier_agreement', $data, $broker, $filename, $download);
    }

    // ── Identity helpers ──────────────────────────────────────────────────────

    /**
     * Resolve broker (shipper) identity, preferring tenant white-label config.
     *
     * Priority:
     *   1. PlatformTenant dba_name / brand_name (if org is a WL tenant)
     *   2. ShipperProfile company_name
     *   3. Organization name
     */
    private function brokerIdentity(User $shipper): array
    {
        $org     = $shipper->org ?? Organization::find($shipper->current_org_id);
        $profile = $shipper->shipperProfile;
        $tenant  = $org?->platformTenant;

        // Display name: tenant DBA → tenant brand → shipper company → org name → user name
        $displayName = $tenant?->dba_name
            ?? $tenant?->brand_name
            ?? $profile?->company_name
            ?? $org?->name
            ?? $shipper->name;

        // Registered address: org has the fields
        $street = $org?->street ?? $profile?->biz_street ?? '';
        $city   = $org?->city   ?? $profile?->biz_city   ?? '';
        $state  = $org?->state  ?? $profile?->biz_state  ?? '';
        $zip    = $org?->zip    ?? $profile?->biz_zip    ?? '';

        $addressLine = implode(', ', array_filter([
            $street,
            $city,
            trim("$state $zip"),
        ]));

        return [
            'name'        => $displayName,
            'legal_name'  => $org?->name ?? $shipper->name,
            'mc_number'   => $org?->fmcsa_broker_mc ?? '',
            'email'       => $org?->email ?? $shipper->email,
            'phone'       => $org?->phone ?? $profile?->business_phone ?? '',
            'address'     => $addressLine,
            // Branding for the PDF header
            'logo_url'    => $tenant?->logo_url_dark ?? null,
            'primary_color' => $tenant?->primary_color ?? '#0096C7',
        ];
    }

    /**
     * Resolve carrier identity from their profile.
     */
    private function carrierIdentity(User $carrier): array
    {
        $profile = $carrier->carrierProfile;
        return [
            'name'        => $profile?->company_name ?? $carrier->name,
            'mc_number'   => $profile?->mc_number ?? '',
            'dot_number'  => $profile?->dot_number ?? '',
            'email'       => $carrier->email,
            'phone'       => $profile?->phone ?? '',
            'address'     => implode(', ', array_filter([
                $profile?->address_street ?? '',
                $profile?->address_city   ?? '',
                trim(($profile?->address_state ?? '') . ' ' . ($profile?->address_zip ?? '')),
            ])),
        ];
    }

    // ── PDF render ────────────────────────────────────────────────────────────

    private function render(string $view, array $data, array $broker, string $filename, bool $download): Response
    {
        $pdf = Pdf::loadView($view, $data)
            ->setPaper('letter', 'portrait')
            ->setWarnings(false);

        $disposition = $download ? 'attachment' : 'inline';

        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
        ]);
    }
}
