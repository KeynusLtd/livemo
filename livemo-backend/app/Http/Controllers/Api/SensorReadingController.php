<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SensorReadingController extends Controller
{
    protected function assertSensorOwner(Request $request, Sensor $sensor): void
    {
        $sensor->loadMissing('farm');
        if ($sensor->farm && $sensor->farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function index(Request $request, Sensor $sensor): JsonResponse
    {
        $this->assertSensorOwner($request, $sensor);

        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'limit' => 'nullable|integer|min:1|max:2000',
        ]);

        $query = SensorReading::query()->where('sensor_id', $sensor->id);

        if (!empty($validated['from'])) {
            $query->where('recorded_at', '>=', $validated['from']);
        }
        if (!empty($validated['to'])) {
            $query->where('recorded_at', '<=', $validated['to']);
        }

        $limit = (int) ($validated['limit'] ?? 500);

        $rows = $query->orderByDesc('recorded_at')->limit($limit)->get();

        return response()->json([
            'sensor' => $sensor,
            'count' => $rows->count(),
            'readings' => $rows,
        ]);
    }
}
