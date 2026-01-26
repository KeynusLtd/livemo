<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\HealthRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FarmInsightsController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    /**
     * Farm health score (rule-based) + trend.
     */
    public function healthScore(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);
        $days = (int) ($validated['days'] ?? 30);

        // Score components
        $totalAnimals = $farm->animals()->count();
        $healthyAnimals = $farm->animals()->where('status', 'healthy')->count();
        $needsAttention = $farm->animals()
            ->where(function ($q) {
                $q->where('status', 'sick')
                    ->orWhere('status', 'quarantine')
                    ->orWhere(function ($q2) {
                        $q2->whereNotNull('health_score')->where('health_score', '<', 70);
                    })
                    ->orWhereHas('alerts', function ($aq) {
                        $aq->where('status', 'pending');
                    });
            })
            ->count();

        $criticalAlerts = $farm->alerts()
            ->whereIn('status', ['pending', 'acknowledged'])
            ->where('severity', 'critical')
            ->count();

        // Basic health score (0..100)
        $healthRate = $totalAnimals > 0 ? ($healthyAnimals / $totalAnimals) : 1;
        $attentionRate = $totalAnimals > 0 ? ($needsAttention / $totalAnimals) : 0;

        $score = 100;
        $score -= (int) round($attentionRate * 60);
        $score -= min(20, $criticalAlerts * 2);
        $score = max(0, min(100, $score));

        // Trend: average health_score per day (fallback to status-derived if health_score missing)
        $from = now()->subDays($days)->toDateString();

        $trend = $farm->animals()
            ->leftJoin('health_records', 'animals.id', '=', 'health_records.animal_id')
            ->where('animals.farm_id', $farm->id)
            ->where('health_records.created_at', '>=', $from)
            ->selectRaw("date(health_records.created_at) as day, avg(coalesce(animals.health_score, case when animals.status = 'healthy' then 90 when animals.status = 'sick' then 50 else 70 end)) as avg_score")
            ->groupBy(DB::raw('date(health_records.created_at)'))
            ->orderBy(DB::raw('date(health_records.created_at)'))
            ->get();

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'score' => $score,
            'components' => [
                'total_animals' => $totalAnimals,
                'healthy_animals' => $healthyAnimals,
                'needs_attention_animals' => $needsAttention,
                'critical_alerts' => $criticalAlerts,
                'health_rate' => round($healthRate * 100, 1),
            ],
            'trend_days' => $days,
            'trend' => $trend,
        ]);
    }

    /**
     * Rule-based anomaly and risk signals for premium dashboard.
     */
    public function riskSignals(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        $days = (int) ($validated['days'] ?? 7);
        $limit = (int) ($validated['limit'] ?? 50);
        $from = now()->subDays($days);

        $animals = $farm->animals()
            ->withCount([
                'alerts as pending_alerts_count' => function ($q) {
                    $q->where('status', 'pending');
                },
            ])
            ->with(['healthRecords' => function ($q) use ($from) {
                $q->where('created_at', '>=', $from)->latest()->limit(1);
            }, 'sensors'])
            ->limit($limit)
            ->get();

        $signals = [];
        foreach ($animals as $animal) {
            $latestRecord = $animal->healthRecords->first();
            $risk = 0;
            $reasons = [];

            if ($animal->status === 'sick' || $animal->status === 'quarantine') {
                $risk += 40;
                $reasons[] = 'status';
            }

            if ($animal->health_score !== null && $animal->health_score < 70) {
                $risk += 35;
                $reasons[] = 'low_health_score';
            }

            if (($animal->pending_alerts_count ?? 0) > 0) {
                $risk += min(25, ($animal->pending_alerts_count ?? 0) * 5);
                $reasons[] = 'pending_alerts';
            }

            if ($latestRecord && $latestRecord->severity === 'critical') {
                $risk += 30;
                $reasons[] = 'critical_vitals';
            }

            if ($latestRecord && $latestRecord->temperature !== null && (float) $latestRecord->temperature > 40.0) {
                $risk += 30;
                $reasons[] = 'high_temperature';
            }

            $risk = max(0, min(100, $risk));

            if ($risk >= 50) {
                $signals[] = [
                    'animal_id' => $animal->id,
                    'tag_id' => $animal->tag_id,
                    'name' => $animal->name,
                    'type' => $animal->type,
                    'status' => $animal->status,
                    'risk_score' => $risk,
                    'reasons' => $reasons,
                    'latest_health_record' => $latestRecord,
                    'pending_alerts_count' => (int) ($animal->pending_alerts_count ?? 0),
                    'sensors_count' => $animal->sensors ? $animal->sensors->count() : 0,
                ];
            }
        }

        usort($signals, fn ($a, $b) => $b['risk_score'] <=> $a['risk_score']);

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'window_days' => $days,
            'signals' => $signals,
        ]);
    }

    /**
     * Basic "alert patterns" (recurring) for premium UX.
     */
    public function alertPatterns(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);
        $days = (int) ($validated['days'] ?? 30);

        $from = now()->subDays($days);

        $recurringByAnimal = $farm->alerts()
            ->where('created_at', '>=', $from)
            ->whereNotNull('animal_id')
            ->selectRaw('animal_id, count(*) as total, sum(case when severity = \'critical\' then 1 else 0 end) as critical')
            ->groupBy('animal_id')
            ->havingRaw('count(*) >= 3')
            ->orderByDesc('total')
            ->limit(25)
            ->get();

        $hotspotsByPasture = $farm->alerts()
            ->where('created_at', '>=', $from)
            ->selectRaw("json_extract(metadata, '$.pasture_id') as pasture_id, count(*) as total")
            ->whereNotNull(DB::raw("json_extract(metadata, '$.pasture_id')"))
            ->groupBy(DB::raw("json_extract(metadata, '$.pasture_id')"))
            ->orderByDesc('total')
            ->limit(25)
            ->get();

        return response()->json([
            'generated_at' => now(),
            'farm_id' => $farm->id,
            'window_days' => $days,
            'recurring_by_animal' => $recurringByAnimal,
            'hotspots_by_pasture' => $hotspotsByPasture,
        ]);
    }
}
