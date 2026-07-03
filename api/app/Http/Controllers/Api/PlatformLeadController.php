<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformLead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PlatformLeadController extends Controller
{
    /**
     * Public: capture a white-label platform lead from the marketing site,
     * store it, and notify sales by email.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'company'          => ['required', 'string', 'max:255'],
            'role'             => ['nullable', 'string', 'max:255'],
            'plan'             => ['nullable', 'string', 'max:50'],
            'monthly_volume'   => ['nullable', 'string', 'max:50'],
            'current_solution' => ['nullable', 'string', 'max:255'],
            'timeline'         => ['nullable', 'string', 'max:50'],
            'message'          => ['nullable', 'string', 'max:5000'],
        ]);

        $data['ip_address'] = $request->ip();

        $lead = PlatformLead::create($data);

        // Sales notification. A mail failure must never fail the submission.
        try {
            $to = config('leads.notify_email');
            if ($to) {
                Mail::raw($this->emailBody($lead), function ($m) use ($to, $lead) {
                    $m->to($to)->subject("New platform lead: {$lead->company} ({$lead->plan})");
                });
            }
        } catch (\Throwable $e) {
            Log::warning('Platform lead email failed: ' . $e->getMessage());
        }

        return response()->json(['data' => ['id' => $lead->id]], 201);
    }

    private function emailBody(PlatformLead $lead): string
    {
        return implode("\n", [
            'New white-label platform lead',
            str_repeat('-', 32),
            "Name:     {$lead->name}",
            "Email:    {$lead->email}",
            "Company:  {$lead->company}",
            "Role:     {$lead->role}",
            "Plan:     {$lead->plan}",
            "Volume:   {$lead->monthly_volume}",
            "Current:  {$lead->current_solution}",
            "Timeline: {$lead->timeline}",
            '',
            'Message:',
            $lead->message ?: '(none)',
            '',
            "Received: {$lead->created_at}  ·  IP: {$lead->ip_address}",
        ]);
    }
}
