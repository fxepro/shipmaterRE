@extends('documents.layout')

@section('doc-type', 'Invoice')
@section('doc-ref', $job->invoice_number . '  ·  ' . $generated)

@section('content')

  {{-- Bill To / Bill From --}}
  <div class="parties">
    <div class="party">
      <div class="party-label">Bill To</div>
      @php
        $shipper = $job->shipper;
        $sp      = $shipper?->shipperProfile;
        $org     = $shipper?->org;
      @endphp
      <div class="party-name">{{ $org?->name ?? $shipper?->name ?? 'Shipper' }}</div>
      <div class="party-detail">
        @if($org?->street) {{ $org->street }}<br>@endif
        @if($org?->city)   {{ $org->city }}@if($org?->state), {{ $org->state }}@endif @if($org?->zip){{ $org->zip }}@endif<br>@endif
        @if($org?->email)  {{ $org->email }}<br>@endif
        @if($org?->phone)  {{ $org->phone }}<br>@endif
      </div>
    </div>
    <div class="party">
      <div class="party-label">From</div>
      <div class="party-name">{{ $broker['name'] }}</div>
      <div class="party-detail">
        @if($broker['mc_number']) MC# {{ $broker['mc_number'] }}<br>@endif
        @if($broker['address'])   {{ $broker['address'] }}<br>@endif
        @if($broker['phone'])     {{ $broker['phone'] }}<br>@endif
        {{ $broker['email'] }}
      </div>
    </div>
  </div>

  {{-- Invoice meta --}}
  <div class="kv-grid" style="margin-bottom:20px">
    <div class="kv-row">
      <div class="kv-key">Invoice #</div>
      <div class="kv-val text-bold">{{ $job->invoice_number }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Invoice Date</div>
      <div class="kv-val">{{ \Carbon\Carbon::parse($invoice_date)->format('M j, Y') }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Due Date</div>
      <div class="kv-val text-bold">{{ \Carbon\Carbon::parse($due_date)->format('M j, Y') }}</div>
    </div>
    <div class="kv-row">
      <div class="kv-key">Job Reference</div>
      <div class="kv-val">{{ $job->reference_number ?? 'JOB-' . $job->id }}</div>
    </div>
    @if($job->title)
    <div class="kv-row">
      <div class="kv-key">Description</div>
      <div class="kv-val">{{ $job->title }}</div>
    </div>
    @endif
    @if($carrier)
    <div class="kv-row">
      <div class="kv-key">Carrier</div>
      <div class="kv-val">{{ $carrier['name'] }}@if($carrier['mc_number']) · MC# {{ $carrier['mc_number'] }}@endif</div>
    </div>
    @endif
    <div class="kv-row">
      <div class="kv-key">Payment Status</div>
      <div class="kv-val">
        @if($job->payment_status === 'paid')
          <span style="color:#16a34a;font-weight:bold">✓ Paid</span>
        @elseif($job->payment_status === 'processing')
          <span style="color:#d97706;font-weight:bold">Processing</span>
        @else
          <span style="color:#dc2626;font-weight:bold">Unpaid</span>
        @endif
      </div>
    </div>
  </div>

  {{-- Route summary --}}
  @if($job->stops->count())
  <div class="section-heading">Shipment Summary</div>
  <table class="data-table" style="margin-bottom:20px">
    <thead>
      <tr>
        <th>Stop</th>
        <th>Location</th>
        <th style="text-align:right">Scheduled</th>
        <th style="text-align:right">Status</th>
      </tr>
    </thead>
    <tbody>
      @foreach($job->stops->sortBy('sequence') as $stop)
      <tr>
        <td>
          <span style="font-weight:bold;text-transform:capitalize;color:{{ $stop->stop_type === 'pickup' ? '#0d9488' : '#334155' }}">
            {{ ucfirst($stop->stop_type) }}
          </span>
        </td>
        <td>
          @if($stop->name)<strong>{{ $stop->name }}</strong><br>@endif
          {{ $stop->city }}, {{ $stop->state }}
        </td>
        <td style="text-align:right;font-size:8.5pt;color:#64748b">
          {{ $stop->scheduled_date?->format('M j, Y') ?? '—' }}
        </td>
        <td style="text-align:right">
          <span class="badge">{{ ucfirst($stop->status) }}</span>
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @endif

  {{-- Charges --}}
  <div class="section-heading">Charges</div>
  <table class="data-table" style="margin-bottom:4px">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;width:25%">Amount</th>
      </tr>
    </thead>
    <tbody>
      @foreach($lines as $line)
      <tr>
        <td>{{ $line['label'] }}</td>
        <td class="text-right" style="font-variant-numeric:tabular-nums">${{ number_format($line['amount'], 2) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- Total --}}
  <div style="display:table;width:100%;margin-top:2px">
    <div style="display:table-cell;width:75%"></div>
    <div style="display:table-cell;width:25%;border-top:2px solid #1a1a2e;padding:10px 0 8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:9pt;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.06em">Total Due</span>
        <span style="font-size:13pt;font-weight:bold;color:{{ $broker['primary_color'] }};font-variant-numeric:tabular-nums">${{ number_format($total, 2) }}</span>
      </div>
    </div>
  </div>

  {{-- Payment instructions --}}
  @if($job->payment_status !== 'paid')
  <div style="margin-top:22px;border:1px solid #bfdbfe;border-radius:4px;background:#eff6ff;padding:14px 16px;">
    <p style="font-size:8.5pt;font-weight:bold;color:#1e40af;margin-bottom:6px">Remittance Instructions</p>
    <p style="font-size:8.5pt;color:#1e3a8a;line-height:1.7">
      Please remit payment by <strong>{{ \Carbon\Carbon::parse($due_date)->format('M j, Y') }}</strong>
      referencing invoice <strong>{{ $job->invoice_number }}</strong>.<br>
      Questions: {{ $broker['email'] }}@if($broker['phone']) · {{ $broker['phone'] }}@endif
    </p>
  </div>
  @else
  <div style="margin-top:22px;border:1px solid #bbf7d0;border-radius:4px;background:#f0fdf4;padding:14px 16px;text-align:center">
    <p style="font-size:11pt;color:#16a34a;font-weight:bold">✓ Payment Received — Thank You</p>
  </div>
  @endif

  {{-- Terms --}}
  <div class="section-heading" style="margin-top:20px">Terms & Conditions</div>
  <p style="font-size:8pt;color:#475569;line-height:1.7">
    Payment is due within 30 days of invoice date unless otherwise agreed in writing. Late payments may be subject to a 1.5% monthly finance charge. Disputes must be submitted in writing within 10 days of invoice receipt. This invoice constitutes a legally binding obligation. All services rendered subject to the applicable Carrier Agreement and Broker-Shipper Agreement.
  </p>

@endsection

@section('footer-text')
  Invoice {{ $job->invoice_number }} · {{ $broker['name'] }}
  @if($broker['mc_number']) · MC# {{ $broker['mc_number'] }}@endif
  · Due {{ \Carbon\Carbon::parse($due_date)->format('M j, Y') }}
@endsection
