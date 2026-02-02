<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    /**
     * Display a listing of farms.
     */
    public function index(Request $request): JsonResponse
    {
        $farms = Farm::where('user_id', $request->user()->id)
            ->with(['animals', 'sensors', 'pastures'])
            ->paginate(15);

        return response()->json($farms);
    }

    /**
     * Store a newly created farm.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'size' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
        ]);

        $farm = Farm::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Farm created successfully',
            'farm' => $farm,
        ], 201);
    }

    /**
     * Display the specified farm.
     */
    public function show(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $farm->load(['animals', 'sensors', 'pastures', 'monitoringStations']);

        return response()->json($farm);
    }

    /**
     * Update the specified farm.
     */
    public function update(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'location' => 'sometimes|string|max:255',
            'size' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:2',
            'is_active' => 'sometimes|boolean',
        ]);

        $farm->update($validated);

        return response()->json([
            'message' => 'Farm updated successfully',
            'farm' => $farm,
        ]);
    }

    /**
     * Remove the specified farm.
     */
    public function destroy(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $farm->delete();

        return response()->json([
            'message' => 'Farm deleted successfully',
        ]);
    }

    /**
     * Get all animals for a specific farm.
     */
    public function animals(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $animals = $farm->animals()
            ->with(['sensors', 'healthRecords' => function($query) {
                $query->latest()->limit(5);
            }])
            ->paginate(20);

        return response()->json($animals);
    }

    /**
     * Get dashboard statistics for a farm.
     */
    public function dashboard(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $now = now();
        $stats = $farm->getDashboardStats();

        $needsAttentionCount = $farm->animals()
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

        $activeAlertsCount = $farm->alerts()->whereIn('status', ['pending', 'acknowledged'])->count();
        $alertsBySeverity = $farm->alerts()
            ->selectRaw('severity, count(*) as count')
            ->whereIn('status', ['pending', 'acknowledged'])
            ->groupBy('severity')
            ->pluck('count', 'severity');

        $sensorFreshThreshold = $now->copy()->subMinutes(30);
        $sensorsOnlineCount = $farm->sensors()
            ->where('status', 'active')
            ->whereNotNull('last_communication')
            ->where('last_communication', '>=', $sensorFreshThreshold)
            ->count();
        $sensorsTotalCount = $farm->sensors()->count();
        $lastSensorSeenAt = $farm->sensors()->max('last_communication');

        $todayDow = (int) $now->dayOfWeekIso; // 1=Mon .. 7=Sun
        $feedingsDueTodayCount = $farm->feedSchedules()
            ->where('is_recurring', true)
            ->where(function ($q) use ($todayDow) {
                $q->whereNull('days_of_week')
                    ->orWhereJsonContains('days_of_week', $todayDow);
            })
            ->where('is_completed', false)
            ->count();

        $pastureRotationsDueCount = $farm->pastures()
            ->whereNotNull('next_rotation')
            ->whereBetween('next_rotation', [$now->toDateString(), $now->copy()->addDays(7)->toDateString()])
            ->count();

        $vaccinationsDueSoonCount = \App\Models\Vaccination::query()
            ->whereHas('animal', function ($q) use ($farm) {
                $q->where('farm_id', $farm->id);
            })
            ->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [$now->toDateString(), $now->copy()->addDays(30)->toDateString()])
            ->count();

        $recentAlerts = $farm->alerts()
            ->with(['animal', 'sensor'])
            ->whereIn('status', ['pending', 'acknowledged'])
            ->orderByRaw("CASE severity WHEN 'critical' THEN 1 WHEN 'severe' THEN 2 WHEN 'warning' THEN 3 WHEN 'moderate' THEN 4 WHEN 'mild' THEN 5 WHEN 'info' THEN 6 ELSE 99 END")
            ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'acknowledged' THEN 2 ELSE 99 END")
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $healthByCategory = $farm->animals()
            ->selectRaw("type, count(*) as total_animals, sum(case when status = 'healthy' then 1 else 0 end) as healthy_animals, avg(health_score) as avg_health_score")
            ->groupBy('type')
            ->orderBy('type')
            ->get();

        $statistics = array_merge($stats, [
            'needs_attention_animals' => $needsAttentionCount,
            'active_alerts' => $activeAlertsCount,
            'alerts_by_severity' => $alertsBySeverity,
            'sensors_total' => $sensorsTotalCount,
            'sensors_online' => $sensorsOnlineCount,
            'sensors_online_percent' => $sensorsTotalCount > 0 ? round(($sensorsOnlineCount / $sensorsTotalCount) * 100, 1) : 0.0,
            'last_sensor_seen_at' => $lastSensorSeenAt,
            'tasks' => [
                'feedings_due_today' => $feedingsDueTodayCount,
                'pasture_rotations_due_7d' => $pastureRotationsDueCount,
                'vaccinations_due_30d' => $vaccinationsDueSoonCount,
            ],
        ]);

        return response()->json([
            'generated_at' => $now,
            'farm' => $farm,
            'statistics' => $statistics,
            'recent_alerts' => $recentAlerts,
            'health_by_category' => $healthByCategory,
        ]);
    }
}
