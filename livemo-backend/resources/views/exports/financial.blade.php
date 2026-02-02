<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report - {{ $farm->name }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .meta { margin-bottom: 20px; color: #666; }
    </style>
</head>
<body>
    <h1>Financial Report</h1>
    <div class="meta">
        <p><strong>Farm:</strong> {{ $farm->name }}</p>
        <p><strong>Period:</strong> {{ $from }} to {{ $to }}</p>
        <p><strong>Generated:</strong> {{ now()->format('Y-m-d H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Total</th>
                <th>Currency</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($orders as $o)
                <tr>
                    <td>{{ $o->order_number }}</td>
                    <td>{{ $o->created_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $o->buyer->name ?? '' }}</td>
                    <td>{{ $o->status }}</td>
                    <td>{{ $o->payment_status }}</td>
                    <td>{{ number_format($o->total, 2) }}</td>
                    <td>{{ $o->currency }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No orders found for this period.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
