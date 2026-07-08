@extends('documents.layout')

@section('doc-type', $is_pickup ? 'Proof of Pickup' : 'Proof of Delivery')
@section('doc-ref', ($is_pickup ? 'POP' : 'POD') . ' · ' . ($job->reference_number ?? 'JOB-' . $job->id) . ' · Stop #' . $stop->id . '  ·  ' . $generated)

@section('content')

  {{-- Parties --}}
  <div class="parties">
    <div class="party">
      <div class="party-label">Broker / Freight Manager</div>
      <div class="party-name">{{ $broker['name'] }}</div>
      <div class="party-detail">
        @if($broker['mc_number']) MC# {{ $broker['mc_number'] }}<br>@endif
        @if($broker['phone']) {{ $broker['phone'] }}<br>@endif
        {{ $broker['email'] }}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Carrier</div>
      @if($carrier)
        <div class="party-name">{{ $carrier['name'] }}</div>
        <div class="party-detail">
          @if($carrier['mc_number']) MC# {{ $carrier['mc_number'] }}<br>@endif
          @if($carrier['dot_number']) DOT# {{ $carrier['dot_number'] }}<br>@endif
          {{ $carrier['email'] }}
        </div>
      @else
        <div class="party-detail" style="color:#94a3b8;font-style:italic">Not assigned</div>
      @endif
    </div>
  </div>

  {{-- Stop details --}}
  <div class="section-heading">{{ $is_pickup ? 'Pickup' : 'Delivery' }} Details</div>
  <div class="kv-grid">
    <div class="kv-row">
      <div class="kv-key">Job Reference</div>
      <div class="kv-val text-bold">{{ $job->reference_number ?? 'JOB-' . $job->id }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Stop</div>
      <div class="kv-val">
        @if($stop->name) <strong>{{ $stop->name }}</strong><br>@endif
        {{ $stop->address }}, {{ $stop->city }}, {{ $stop->state }} {{ $stop->zip }}
      </div>
    </div>
    @if($stop->contact_name)
    <div class="kv-row">
      <div class="kv-key">Contact</div>
      <div class="kv-val">{{ $stop->contact_name }}@if($stop->contact_phone) · {{ $stop->contact_phone }}@endif</div>
    </div>
    @endif
    @if($stop->weight_lbs)
    <div class="kv-row">
      <div class="kv-key">Weight</div>
      <div class="kv-val">{{ number_format($stop->weight_lbs) }} lbs</div>
    </div>
    @endif
    @if($stop->arrived_at)
    <div class="kv-row">
      <div class="kv-key">Arrived</div>
      <div class="kv-val">{{ $stop->arrived_at->format('M j, Y g:i A') }}</div>
    </div>
    @endif
    @if($stop->completed_at)
    <div class="kv-row">
      <div class="kv-key">Completed</div>
      <div class="kv-val text-bold" style="color:#16a34a">{{ $stop->completed_at->format('M j, Y g:i A') }}</div>
    </div>
    @endif
    @if($stop->carrier_notes)
    <div class="kv-row">
      <div class="kv-key">Driver Notes</div>
      <div class="kv-val">{{ $stop->carrier_notes }}</div>
    </div>
    @endif
    @if($stop->special_instructions)
    <div class="kv-row">
      <div class="kv-key">Instructions</div>
      <div class="kv-val">{{ $stop->special_instructions }}</div>
    </div>
    @endif
  </div>

  {{-- Photos --}}
  @if($photos->count())
  <div class="section-heading">Photo Evidence ({{ $photos->count() }} image{{ $photos->count() !== 1 ? 's' : '' }})</div>
  <div style="display:table;width:100%">
    @php $col = 0; @endphp
    @foreach($photos as $i => $photoUri)
      @if($photoUri)
        @if($col % 3 === 0)
          @if($col > 0)</div>@endif
          <div style="display:table-row">
        @endif
        <div style="display:table-cell;width:33%;padding:4px;vertical-align:top">
          <img src="{{ $photoUri }}" alt="Evidence {{ $i + 1 }}"
               style="width:100%;max-height:150px;object-fit:cover;border-radius:4px;border:1px solid #e2e8f0" />
        </div>
        @php $col++; @endphp
      @endif
    @endforeach
    @if($col > 0)</div>@endif
  </div>
  @else
  <div class="section-heading">Photo Evidence</div>
  <p style="font-size:8.5pt;color:#94a3b8;font-style:italic">No photos recorded for this stop.</p>
  @endif

  {{-- Signature --}}
  <div class="section-heading">{{ $is_pickup ? 'Pickup' : 'Delivery' }} Confirmation</div>

  @if($stop->signature_url && $signature_b64)
  <div style="display:table;width:100%;margin-bottom:16px">
    <div style="display:table-cell;width:50%;vertical-align:top;padding-right:20px">
      <div style="border:1px solid #e2e8f0;border-radius:4px;padding:8px;background:#f8fafc;min-height:70px;text-align:center">
        <img src="{{ $signature_b64 }}" alt="Signature"
             style="max-height:64px;max-width:220px;object-fit:contain" />
      </div>
      <div style="margin-top:6px;font-size:8pt;color:#475569">
        <strong>{{ $stop->signature_name }}</strong><br>
        @if($stop->signature_at) {{ $stop->signature_at->format('M j, Y g:i A') }}<br>@endif
        @if($stop->signature_ip) <span style="color:#94a3b8">IP: {{ $stop->signature_ip }}</span>@endif
      </div>
    </div>
    <div style="display:table-cell;width:50%;vertical-align:middle;padding-left:20px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;padding:12px;text-align:center">
        <div style="font-size:18pt;color:#16a34a">✓</div>
        <div style="font-size:9pt;font-weight:bold;color:#15803d">
          {{ $is_pickup ? 'Freight Received' : 'Delivery Confirmed' }}
        </div>
        <div style="font-size:8pt;color:#16a34a;margin-top:2px">Electronically signed</div>
      </div>
    </div>
  </div>
  @else
  <div class="sig-grid">
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label">{{ $is_pickup ? 'Shipper' : 'Consignee' }} Signature &amp; Date</div>
      <div style="font-size:8pt;color:#94a3b8;margin-top:4px">Please sign to confirm {{ $is_pickup ? 'pickup' : 'delivery' }}</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <div class="sig-label">Printed Name &amp; Date</div>
    </div>
  </div>
  @endif

  {{-- Condition notes --}}
  <div style="margin-top:16px;border:1px solid #fde68a;border-radius:4px;background:#fffbeb;padding:10px 14px;">
    <p style="font-size:8pt;font-weight:bold;color:#92400e;margin-bottom:4px">Exceptions / Damage Notes</p>
    @if($stop->carrier_notes)
      <p style="font-size:8.5pt;color:#78350f">{{ $stop->carrier_notes }}</p>
    @else
      <p style="font-size:8.5pt;color:#d97706;font-style:italic">None noted — freight received in apparent good condition.</p>
    @endif
  </div>

@endsection

@section('footer-text')
  {{ $is_pickup ? 'Proof of Pickup' : 'Proof of Delivery' }} · {{ $broker['name'] }}
  · Ref: {{ $job->reference_number ?? 'JOB-'.$job->id }} · Stop #{{ $stop->id }}
@endsection
