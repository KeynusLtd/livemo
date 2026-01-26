<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\HealthRecord;
use App\Models\Marketplace\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FarmExportController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function health(Request $request, Farm $farm): StreamedResponse|JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'format' => 'in:csv,json,pdf',
        ]);

        $format = $validated['format'] ?? 'json';
        $from = $validated['from'] ?? now()->subDays(30)->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $records = HealthRecord::query()
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('animal', function ($q) use ($farm) {
                $q->where('farm_id', $farm->id);
            })
            ->with(['animal'])
            ->orderBy('created_at')
            ->get();

        if ($format === 'csv') {
            $filename = "farm-{$farm->id}-health-{$from}_to_{$to}.csv";
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            return response()->stream(function () use ($records) {
                $output = fopen('php://output', 'w');
                fputcsv($output, ['Date', 'Animal Tag', 'Animal Name', 'Type', 'Severity', 'Temperature', 'Heart Rate', 'Activity', 'Notes']);
                foreach ($records as $r) {
                    fputcsv($output, [
                        $r->created_at->toDateString(),
                        $r->animal->tag_id ?? '',
                        $r->animal->name ?? '',
                        $r->animal->type ?? '',
                        $r->severity,
                        $r->temperature,
                        $r->heart_rate,
                        $r->activity_level,
                        $r->notes,
                    ]);
                }
                fclose($output);
            }, 200, $headers);
        }

        if ($format === 'pdf') {
            $filename = "farm-{$farm->id}-health-{$from}_to_{$to}.pdf";
            $pdf = Pdf::loadView('exports.health', [
                'farm' => $farm,
                'from' => $from,
                'to' => $to,
                'records' => $records,
            ]);
            return $pdf->download($filename);
        }

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'range' => ['from' => $from, 'to' => $to],
            'records' => $records,
        ]);
    }

    public function operations(Request $request, Farm $farm): StreamedResponse|JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
            'format' => 'in:csv,json,pdf',
        ]);

        $format = $validated['format'] ?? 'json';
        $days = (int) ($validated['days'] ?? 30);
        $from = now()->subDays($days);

        $feedCompleted = $farm->feedSchedules()
            ->where('is_completed', true)
            ->where('completed_at', '>=', $from)
            ->with(['animal', 'completedBy'])
            ->get();

        $pastureRotationsDue = $farm->pastures()
            ->whereNotNull('next_rotation')
            ->whereBetween('next_rotation', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->get();

        $breedingDueBirths = DB::table('breeding_records')
            ->where('farm_id', $farm->id)
            ->whereNull('actual_birth_date')
            ->whereNotNull('expected_birth_date')
            ->whereBetween('expected_birth_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->get();

        if ($format === 'csv') {
            $filename = "farm-{$farm->id}-operations-{$days}d.csv";
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            return response()->stream(function () use ($feedCompleted, $pastureRotationsDue, $breedingDueBirths) {
                $output = fopen('php://output', 'w');
                fputcsv($output, ['Section', 'Date', 'Item', 'Details']);
                foreach ($feedCompleted as $f) {
                    fputcsv($output, [
                        'Feed',
                        $f->completed_at->toDateTimeString(),
                        $f->feed_type,
                        ($f->animal->name ?? '') . ' (' . ($f->animal->tag_id ?? '') . ')',
                    ]);
                }
                foreach ($pastureRotationsDue as $p) {
                    fputcsv($output, [
                        'Pasture Rotation',
                        $p->next_rotation,
                        $p->name,
                        'Capacity: ' . $p->capacity,
                    ]);
                }
                foreach ($breedingDueBirths as $b) {
                    fputcsv($output, [
                        'Breeding',
                        $b->expected_birth_date,
                        'Birth Due',
                        'Mother ID: ' . $b->mother_id,
                    ]);
                }
                fclose($output);
            }, 200, $headers);
        }

        if ($format === 'pdf') {
            $filename = "farm-{$farm->id}-operations-{$days}d.pdf";
            $pdf = Pdf::loadView('exports.operations', [
                'farm' => $farm,
                'days' => $days,
                'feedCompleted' => $feedCompleted,
                'pastureRotationsDue' => $pastureRotationsDue,
                'breedingDueBirths' => $breedingDueBirths,
            ]);
            return $pdf->download($filename);
        }

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'window_days' => $days,
            'feed_completed' => $feedCompleted,
            'pasture_rotations_due' => $pastureRotationsDue,
            'breeding_due_births' => $breedingDueBirths,
        ]);
    }

    public function financial(Request $request, Farm $farm): StreamedResponse|JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'format' => 'in:csv,json,pdf',
        ]);

        $format = $validated['format'] ?? 'json';
        $from = $validated['from'] ?? now()->startOfMonth()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $orders = Order::query()
            ->where('seller_id', $request->user()->id)
            ->whereBetween('created_at', [$from, $to])
            ->with(['buyer', 'items.listing'])
            ->get();

        if ($format === 'csv') {
            $filename = "farm-{$farm->id}-financial-{$from}_to_{$to}.csv";
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            return response()->stream(function () use ($orders) {
                $output = fopen('php://output', 'w');
                fputcsv($output, ['Order Number', 'Date', 'Buyer', 'Status', 'Payment Status', 'Total', 'Currency']);
                foreach ($orders as $o) {
                    fputcsv($output, [
                        $o->order_number,
                        $o->created_at->toDateTimeString(),
                        $o->buyer->name ?? '',
                        $o->status,
                        $o->payment_status,
                        $o->total,
                        $o->currency,
                    ]);
                }
                fclose($output);
            }, 200, $headers);
        }

        if ($format === 'pdf') {
            $filename = "farm-{$farm->id}-financial-{$from}_to_{$to}.pdf";
            $pdf = Pdf::loadView('exports.financial', [
                'farm' => $farm,
                'from' => $from,
                'to' => $to,
                'orders' => $orders,
            ]);
            return $pdf->download($filename);
        }

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'range' => ['from' => $from, 'to' => $to],
            'orders' => $orders,
        ]);
    }
}
