@extends('documents.layout')

@section('doc-type', 'Rate Confirmation')
@section('doc-ref', 'Ref: ' . ($job->reference_number ?? 'JOB-' . $job->id) . '  ·  ' . $generated)

@section('content')

  {{-- Parties --}}
  <div class="parties">
    <div class="party">
      <div class="party-label">Broker / Freight Manager</div>
      <div class="party-name">{{ $broker['name'] }}</div>
      <div class="party-detail">
        @if($broker['mc_number']) MC# {{ $broker['mc_number'] }}<br>@endif
        @if($broker['address']) {{ $broker['address'] }}<br>@endif
        @if($broker['phone']) {{ $broker['phone'] }}<br>@endif
        {{ $broker['email'] }}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Carrier</div>
      <div class="party-name">{{ $carrier['name'] }}</div>
      <div class="party-detail">
        @if($carrier['mc_number']) MC# {{ $carrier['mc_number'] }}<br>@endif
        @if($carrier['dot_number']) DOT# {{ $carrier['dot_number'] }}<br>@endif
        @if($carrier['address']) {{ $carrier['address'] }}<br>@endif
        @if($carrier['phone']) {{ $carrier['phone'] }}<br>@endif
        {{ $carrier['email'] }}
      </div>
    </div>
  </div>

  {{-- Load details --}}
  <div class="section-heading">Load Details</div>
  <div class="kv-grid">
    <div class="kv-row">
      <div class="kv-key">Job Reference</div>
      <div class="kv-val text-bold">{{ $job->reference_number ?? 'JOB-' . $job->id }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Description</div>
      <div class="kv-val">{{ $job->title ?? '—' }}</div>
    </div>
    @if($job->total_weight_lbs)
    <div class="kv-row">
      <div class="kv-key">Total Weight</div>
      <div class="kv-val">{{ number_format($job->total_weight_lbs) }} lbs</div>
    </div>
    @endif
    @if($job->route_distance_miles)
    <div class="kv-row">
      <div class="kv-key">Route Distance</div>
      <div class="kv-val">{{ number_format($job->route_distance_miles, 0) }} miles</div>
    </div>
    @endif
    @if($job->special_instructions)
    <div class="kv-row">
      <div class="kv-key">Special Instructions</div>
      <div class="kv-val">{{ $job->special_instructions }}</div>
    </div>
    @endif
  </div>

  {{-- Stops --}}
  @if($stops->count())
  <div class="section-heading">Pickup &amp; Delivery Stops</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width:6%">#</th>
        <th style="width:12%">Type</th>
        <th>Location</th>
        <th style="width:20%">Scheduled</th>
        <th style="width:14%">Contact</th>
      </tr>
    </thead>
    <tbody>
      @foreach($stops as $i => $stop)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>
          <span class="badge">{{ ucfirst($stop->stop_type) }}</span>
        </td>
        <td>
          @if($stop->name) <strong>{{ $stop->name }}</strong><br>@endif
          {{ $stop->address_line ?? ($stop->location?->address ?? '—') }}
        </td>
        <td>
          @if($stop->scheduled_at)
            {{ \Carbon\Carbon::parse($stop->scheduled_at)->format('M j, Y') }}<br>
            <span style="color:#64748b">{{ \Carbon\Carbon::parse($stop->scheduled_at)->format('g:i A') }}</span>
          @else
            —
          @endif
        </td>
        <td>{{ $stop->contact_name ?? '—' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @endif

  {{-- Rate & charges --}}
  <div class="section-heading">Rate &amp; Charges</div>
  <table class="totals-table">
    @if(!empty($breakdown))
      @foreach($breakdown as $line => $amount)
      <tr>
        <td class="total-label" style="color:#475569">{{ ucwords(str_replace('_', ' ', $line)) }}</td>
        <td class="total-amount" style="color:#475569">${{ number_format((float)$amount, 2) }}</td>
      </tr>
      @endforeach
    @endif
    <tr class="total-row">
      <td class="total-label">Total</td>
      <td class="total-amount">${{ number_format($total, 2) }}</td>
    </tr>
  </table>

  {{-- Terms --}}
  <div class="section-heading">Terms &amp; Conditions</div>
  <div style="font-size:8.5pt; color:#475569; line-height:1.7">
    <p>By accepting this Rate Confirmation, the Carrier agrees to transport the above-described freight under the terms set forth herein and any applicable Master Transportation Agreement between the parties.</p>
    <br>
    <p><strong>Payment:</strong> Payment will be issued per the agreed payment terms upon receipt of a signed Proof of Delivery (POD) and a valid invoice.</p>
    <br>
    <p><strong>Liability:</strong> Carrier assumes full liability for freight from pickup through delivery. Carrier must maintain cargo insurance at or above the coverage level specified in the Carrier Agreement.</p>
    <br>
    <p><strong>Double Brokering:</strong> Re-brokering or subcontracting this load to another carrier without prior written consent from {{ $broker['name'] }} is strictly prohibited.</p>
  </div>

  {{-- Signatures --}}
  <div class="sig-grid">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label">Carrier Authorised Signature &amp; Date</div>
      <div style="font-size:8pt; color:#94a3b8; margin-top:4px">{{ $carrier['name'] }}</div>
    </div>
    <div class="sig-col">
      <div class="sig-line">
        @if($job->signed_at ?? false)
          <div style="font-size:9pt; color:#16a34a; padding-top:8px">✓ Electronically accepted {{ \Carbon\Carbon::parse($job->signed_at)->format('M j, Y') }}</div>
        @endif
      </div>
      <div class="sig-label">Broker Authorised Representative &amp; Date</div>
      <div style="font-size:8pt; color:#94a3b8; margin-top:4px">{{ $broker['name'] }}</div>
    </div>
  </div>

@endsection

@section('footer-text')
  This Rate Confirmation constitutes a binding agreement between {{ $broker['name'] }} and {{ $carrier['name'] }}.
  @if($broker['mc_number']) {{ $broker['name'] }} operates under MC# {{ $broker['mc_number'] }}. @endif
@endsection
