@extends('documents.layout')

@section('doc-type', 'Carrier Agreement')
@section('doc-ref', 'Agreement #' . $contract->id . '  ·  ' . $generated)

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

  {{-- Agreement terms --}}
  <div class="section-heading">Agreement Terms</div>
  <div class="kv-grid">
    <div class="kv-row">
      <div class="kv-key">Agreement ID</div>
      <div class="kv-val text-bold">#{{ $contract->id }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Rate Type</div>
      <div class="kv-val">{{ $contract->rate_type }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Base Rate</div>
      <div class="kv-val text-bold">${{ number_format($contract->rate, 2) }}
        @if($contract->rate_type === 'Per mile') <span style="color:#64748b;font-weight:normal">per mile</span>
        @elseif($contract->rate_type === 'Hourly') <span style="color:#64748b;font-weight:normal">per hour</span>
        @endif
      </div>
    </div>
    @if($contract->fuel_surcharge)
    <div class="kv-row">
      <div class="kv-key">Fuel Surcharge</div>
      <div class="kv-val">${{ number_format($contract->fuel_surcharge, 2) }}</div>
    </div>
    @endif
    @if($contract->detention_rate)
    <div class="kv-row">
      <div class="kv-key">Detention Rate</div>
      <div class="kv-val">${{ number_format($contract->detention_rate, 2) }}/hr after {{ $contract->free_time_hrs }}hr free time</div>
    </div>
    @endif
    @if($contract->equipment_type)
    <div class="kv-row">
      <div class="kv-key">Equipment Type</div>
      <div class="kv-val">{{ $contract->equipment_type }}</div>
    </div>
    @endif
    @if($contract->max_weight_lbs)
    <div class="kv-row">
      <div class="kv-key">Max Weight</div>
      <div class="kv-val">{{ number_format($contract->max_weight_lbs) }} lbs</div>
    </div>
    @endif
    <div class="kv-row">
      <div class="kv-key">Payment Terms</div>
      <div class="kv-val">{{ $contract->payment_terms }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Priority</div>
      <div class="kv-val">{{ $contract->priority }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Coverage</div>
      <div class="kv-val">{{ $contract->coverage }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Valid Period</div>
      <div class="kv-val">{{ $contract->valid_from->format('M j, Y') }} — {{ $contract->valid_to->format('M j, Y') }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Auto-Renew</div>
      <div class="kv-val">{{ $contract->auto_renew ? 'Yes' : 'No' }}</div>
    </div>
    @if($contract->notes)
    <div class="kv-row">
      <div class="kv-key">Notes</div>
      <div class="kv-val">{{ $contract->notes }}</div>
    </div>
    @endif
  </div>

  {{-- Standard clauses --}}
  <div class="section-heading">Standard Clauses</div>
  <div style="font-size:8.5pt; color:#475569; line-height:1.8">

    <p><strong>1. Scope.</strong> This Agreement governs all freight transactions between {{ $broker['name'] }} ("Broker") and {{ $carrier['name'] }} ("Carrier") during the validity period above. Individual loads are governed by Rate Confirmations issued under this Agreement.</p>
    <br>
    <p><strong>2. Insurance.</strong> Carrier shall maintain, at minimum, the following insurance coverage throughout the term: (a) Auto Liability — $1,000,000 combined single limit; (b) Cargo — $100,000 per occurrence; (c) General Liability — $1,000,000 per occurrence. Broker must be named as additional insured.</p>
    <br>
    <p><strong>3. Compliance.</strong> Carrier represents and warrants that it holds valid operating authority as required by applicable law, including FMCSA authority, and that all drivers comply with Hours of Service, drug &amp; alcohol testing, and other applicable regulations.</p>
    <br>
    <p><strong>4. Payment.</strong> Broker will remit payment per the payment terms above, calculated from receipt of a complete, accurate invoice accompanied by a signed Proof of Delivery. Disputed invoices will be resolved within 15 business days.</p>
    <br>
    <p><strong>5. Double Brokering.</strong> Carrier shall not re-broker, sub-contract, or assign any shipment tendered under this Agreement to any other motor carrier without prior written approval from Broker.</p>
    <br>
    <p><strong>6. Indemnification.</strong> Each party agrees to indemnify and hold the other harmless from any claims, damages, or losses arising out of that party's own negligence or wilful misconduct in connection with this Agreement.</p>
    <br>
    <p><strong>7. Governing Law.</strong> This Agreement is governed by the laws of the jurisdiction in which Broker maintains its principal place of business, without regard to conflict of law principles.</p>
  </div>

  {{-- Signatures --}}
  <div class="section-heading">Execution</div>
  <div class="sig-grid">
    <div class="sig-col">
      @if($contract->signed_at)
        <div style="font-size:9pt; color:#16a34a; border-bottom:1px solid #16a34a; height:36px; padding-top:8px">
          ✓ Signed electronically — {{ \Carbon\Carbon::parse($contract->signed_at)->format('M j, Y') }}
        </div>
      @else
        <div class="sig-line"></div>
      @endif
      <div class="sig-label">Carrier Authorised Signature &amp; Date</div>
      <div style="font-size:8pt; color:#94a3b8; margin-top:4px">{{ $carrier['name'] }}</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label">Broker Authorised Representative &amp; Date</div>
      <div style="font-size:8pt; color:#94a3b8; margin-top:4px">{{ $broker['name'] }}</div>
    </div>
  </div>

@endsection

@section('footer-text')
  This Carrier Agreement is between {{ $broker['name'] }} and {{ $carrier['name'] }}.
  @if($broker['mc_number']) {{ $broker['name'] }} operates under MC# {{ $broker['mc_number'] }}. @endif
  Agreement #{{ $contract->id }} · Valid {{ $contract->valid_from->format('M j, Y') }}–{{ $contract->valid_to->format('M j, Y') }}.
@endsection
