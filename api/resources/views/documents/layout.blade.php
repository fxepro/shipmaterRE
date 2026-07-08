<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DejaVu Sans', Arial, sans-serif;
      font-size: 10pt;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.5;
    }

    /* ── Page layout ── */
    .page {
      padding: 0;
      width: 100%;
    }

    /* ── Header ── */
    .header {
      background: {{ $broker['primary_color'] }};
      padding: 22px 36px;
      color: #fff;
    }
    .header-inner {
      display: table;
      width: 100%;
    }
    .header-logo {
      display: table-cell;
      vertical-align: middle;
      width: 50%;
    }
    .header-logo img {
      max-height: 44px;
      max-width: 180px;
    }
    .header-name {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #fff;
    }
    .header-meta {
      display: table-cell;
      vertical-align: middle;
      text-align: right;
      width: 50%;
    }
    .doc-type {
      font-size: 13pt;
      font-weight: bold;
      color: #fff;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .doc-ref {
      font-size: 9pt;
      color: rgba(255,255,255,0.80);
      margin-top: 3px;
    }

    /* ── Body padding ── */
    .body {
      padding: 28px 36px 20px;
    }

    /* ── Parties section ── */
    .parties {
      display: table;
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      margin-bottom: 22px;
    }
    .party {
      display: table-cell;
      width: 50%;
      padding: 14px 16px;
      vertical-align: top;
    }
    .party + .party {
      border-left: 1px solid #e2e8f0;
    }
    .party-label {
      font-size: 7pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 4px;
    }
    .party-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a2e;
      margin-bottom: 3px;
    }
    .party-detail {
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.6;
    }

    /* ── Section heading ── */
    .section-heading {
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 12px;
      margin-top: 20px;
    }

    /* ── Data table ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .data-table th {
      text-align: left;
      font-size: 7.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      padding: 6px 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: top;
    }
    .data-table tr:last-child td { border-bottom: none; }

    /* ── Key-value pairs ── */
    .kv-grid {
      display: table;
      width: 100%;
    }
    .kv-row {
      display: table-row;
    }
    .kv-key {
      display: table-cell;
      width: 38%;
      padding: 5px 0;
      font-size: 8.5pt;
      color: #64748b;
      vertical-align: top;
    }
    .kv-val {
      display: table-cell;
      width: 62%;
      padding: 5px 0;
      font-size: 9pt;
      font-weight: 500;
      color: #1e293b;
      vertical-align: top;
    }

    /* ── Totals row ── */
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-top: 4px;
    }
    .totals-table td {
      padding: 6px 10px;
    }
    .totals-table .total-row td {
      border-top: 2px solid #e2e8f0;
      font-weight: bold;
      font-size: 10.5pt;
      color: #1a1a2e;
    }
    .totals-table .total-label { text-align: left; }
    .totals-table .total-amount { text-align: right; font-variant-numeric: tabular-nums; }

    /* ── Signature block ── */
    .sig-grid {
      display: table;
      width: 100%;
      margin-top: 28px;
    }
    .sig-col {
      display: table-cell;
      width: 48%;
      vertical-align: top;
    }
    .sig-col + .sig-col { padding-left: 4%; }
    .sig-line {
      border-bottom: 1px solid #94a3b8;
      height: 36px;
      width: 100%;
      margin-bottom: 6px;
    }
    .sig-label {
      font-size: 8pt;
      color: #64748b;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 28px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: center;
    }

    /* ── Utilities ── */
    .text-right { text-align: right; }
    .text-bold  { font-weight: bold; }
    .color-accent { color: {{ $broker['primary_color'] }}; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: {{ $broker['primary_color'] }}22;
      color: {{ $broker['primary_color'] }};
    }
  </style>
</head>
<body>
<div class="page">

  {{-- Header --}}
  <div class="header">
    <div class="header-inner">
      <div class="header-logo">
        @if($broker['logo_url'])
          <img src="{{ $broker['logo_url'] }}" alt="{{ $broker['name'] }}" />
        @else
          <div class="header-name">{{ $broker['name'] }}</div>
        @endif
      </div>
      <div class="header-meta">
        <div class="doc-type">@yield('doc-type')</div>
        <div class="doc-ref">@yield('doc-ref')</div>
      </div>
    </div>
  </div>

  {{-- Body --}}
  <div class="body">
    @yield('content')

    {{-- Footer --}}
    <div class="footer">
      @yield('footer-text', 'This document is computer-generated and is valid without a wet signature unless otherwise indicated.')
      &nbsp;·&nbsp; Generated {{ $generated }}
    </div>
  </div>

</div>
</body>
</html>
