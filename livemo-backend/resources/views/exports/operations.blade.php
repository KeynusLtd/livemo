<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Operations Report - {{ $farm->name }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .meta { margin-bottom: 20px; color: #666; }
    </style>
</head>
<body>
    <h1>Operations Report</h1>
    <div class="meta">
        <p><strong>Farm:</strong> {{ $farm->name }}</p>
        <p><strong>Window:</strong> Last {{ $days }} days</p>
        <p><strong>Generated:</strong> {{ now()->format('Y-m-d H:i') }}</p>
    </div>

    <h2>Feedings Completed</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Feed Type</th>
                <th>Animal</th>
                <th>Completed By</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($feedCompleted as $f)
                <tr>
                    <td>{{ $f->completed_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $f->feed_type }}</td>
                    <td>{{ $f->animal->name ?? '' }} ({{ $f->animal->tag_id ?? '' }})</td>
                    <td>{{ $f->completedBy->name ?? '' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">No feedings completed in this window.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Pasture Rotations Due (Next 7 Days)</h2>
    <table>
        <thead>
            <tr>
                <th>Pasture</th>
                <th>Next Rotation Date</th>
                <th>Capacity</th>
                <th>Current Occupancy</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($pastureRotationsDue as $p)
                <tr>
                    <td>{{ $p->name }}</td>
                    <td>{{ $p->next_rotation }}</td>
                    <td>{{ $p->capacity }}</td>
                    <td>{{ $p->current_occupancy }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">No pasture rotations due in the next 7 days.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Breeding: Births Due (Next 30 Days)</h2>
    <table>
        <thead>
            <tr>
                <th>Expected Birth Date</th>
                <th>Mother ID</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($breedingDueBirths as $b)
                <tr>
                    <td>{{ $b->expected_birth_date }}</td>
                    <td>{{ $b->mother_id }}</td>
                    <td>{{ $b->status }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3">No births due in the next 30 days.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
