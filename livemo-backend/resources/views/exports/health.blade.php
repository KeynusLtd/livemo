<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Health Report - {{ $farm->name }}</title>
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
    <h1>Health Report</h1>
    <div class="meta">
        <p><strong>Farm:</strong> {{ $farm->name }}</p>
        <p><strong>Period:</strong> {{ $from }} to {{ $to }}</p>
        <p><strong>Generated:</strong> {{ now()->format('Y-m-d H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Animal Tag</th>
                <th>Animal Name</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Temperature</th>
                <th>Heart Rate</th>
                <th>Activity</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($records as $r)
                <tr>
                    <td>{{ $r->created_at->format('Y-m-d') }}</td>
                    <td>{{ $r->animal->tag_id ?? '' }}</td>
                    <td>{{ $r->animal->name ?? '' }}</td>
                    <td>{{ $r->animal->type ?? '' }}</td>
                    <td>{{ $r->severity }}</td>
                    <td>{{ $r->temperature }}</td>
                    <td>{{ $r->heart_rate }}</td>
                    <td>{{ $r->activity_level }}</td>
                    <td>{{ $r->notes }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9">No health records found for this period.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
