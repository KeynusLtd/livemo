<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\HealthRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FarmReportsController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($farm->user_id !== $user->id) {
            abort(403);
        }
    }

    public function health(Request $request, Farm $farm): JsonResponse
    {
        try {
            $this->assertFarmOwner($request, $farm);

            $validated = $request->validate([
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
            ]);

            $from = $validated['from'] ?? now()->subDays(30)->toDateString();
            $to = $validated['to'] ?? now()->toDateString();

            $recordsQuery = HealthRecord::query()
                ->whereBetween('health_records.created_at', [$from, $to])
                ->whereHas('animal', function ($q) use ($farm) {
                    $q->where('farm_id', $farm->id);
                });

            $totalRecords = (clone $recordsQuery)->count();
            $bySeverity = (clone $recordsQuery)
                ->selectRaw('severity, count(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity');

            $byType = $recordsQuery
                ->join('animals', 'animals.id', '=', 'health_records.animal_id')
                ->selectRaw('animals.type as type, count(*) as count')
                ->groupBy('animals.type')
                ->pluck('count', 'type');

            $latestCritical = HealthRecord::query()
                ->with('animal')
                ->whereHas('animal', function ($q) use ($farm) {
                    $q->where('farm_id', $farm->id);
                })
                ->where('severity', 'critical')
                ->latest()
                ->limit(20)
                ->get();

            return response()->json([
                'generated_at' => now(),
                'farm_id' => $farm->id,
                'range' => ['from' => $from, 'to' => $to],
                'summary' => [
                    'total_records' => (int) $totalRecords,
                    'by_severity' => $bySeverity,
                    'by_animal_type' => $byType,
                ],
                'latest_critical' => $latestCritical,
            ]);
        } catch (\Throwable $e) {
            Log::error('Farm health report failed', [
                'message' => $e->getMessage(),
                'farm_id' => $farm->id,
                'user_id' => optional($request->user())->id,
            ]);

            $payload = [
                'message' => 'Unable to load health report',
            ];

            if (config('app.debug')) {
                $payload['exception'] = $e->getMessage();
                $payload['file'] = $e->getFile();
                $payload['line'] = $e->getLine();
            }

            return response()->json($payload, 500);
        }
    }

    public function operations(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $from = now()->subDays($days);

        $feedCompleted = $farm->feedSchedules()
            ->where('is_completed', true)
            ->where('completed_at', '>=', $from)
            ->count();

        $feedPending = $farm->feedSchedules()
            ->where('is_completed', false)
            ->count();

        $pastureActive = $farm->pastures()->where('is_active', true)->count();
        $pastureRotationsDue = $farm->pastures()
            ->whereNotNull('next_rotation')
            ->whereBetween('next_rotation', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->count();

        $breedingDueBirths = DB::table('breeding_records')
            ->where('farm_id', $farm->id)
            ->whereNull('actual_birth_date')
            ->whereNotNull('expected_birth_date')
            ->whereBetween('expected_birth_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->count();

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'window_days' => $days,
            'summary' => [
                'feedings_completed' => (int) $feedCompleted,
                'feedings_pending' => (int) $feedPending,
                'pastures_active' => (int) $pastureActive,
                'pasture_rotations_due_7d' => (int) $pastureRotationsDue,
                'breeding_due_births_30d' => (int) $breedingDueBirths,
            ],
        ]);
    }

    public function financial(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        // MVP: marketplace revenue as seller (not strictly farm-linked in schema)
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $from = $validated['from'] ?? now()->startOfMonth()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $sellerId = $request->user()->id;

        $orders = \App\Models\Marketplace\Order::query()
            ->where('seller_id', $sellerId)
            ->whereBetween('created_at', [$from, $to]);

        $revenue = (clone $orders)->where('payment_status', 'completed')->sum('total');
        $ordersCount = (clone $orders)->count();

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'range' => ['from' => $from, 'to' => $to],
            'summary' => [
                'marketplace_orders' => (int) $ordersCount,
                'marketplace_revenue_total' => (float) $revenue,
            ],
            'notes' => 'Marketplace revenue is currently computed per seller account. To make it farm-specific, link listings/orders to farm_id.',
        ]);
    }
}
