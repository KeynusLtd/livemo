<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sensor;
use App\Services\SensorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SensorController extends Controller
{
    public function __construct(
        protected SensorService $sensorService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Sensor::with(['farm', 'animal']);

        if ($request->has('farm_id')) {
            $query->where('farm_id', $request->farm_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sensors = $query->paginate(20);

        return response()->json($sensors);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => 'required|string|unique:sensors,device_id',
            'type' => 'required|in:wearable,collar,ear_tag,environmental,camera',
            'farm_id' => 'required|exists:farms,id',
            'animal_id' => 'nullable|exists:animals,id',
            'configuration' => 'nullable|array',
        ]);

        $sensor = Sensor::create($validated);

        return response()->json([
            'message' => 'Sensor registered successfully',
            'sensor' => $sensor,
        ], 201);
    }

    public function show(Sensor $sensor): JsonResponse
    {
        return response()->json($sensor->load(['farm', 'animal']));
    }

    public function update(Request $request, Sensor $sensor): JsonResponse
    {
        $validated = $request->validate([
            'animal_id' => 'nullable|exists:animals,id',
            'status' => 'sometimes|in:active,inactive,maintenance,lost',
            'battery_level' => 'nullable|integer|min:0|max:100',
            'configuration' => 'nullable|array',
        ]);

        $sensor->update($validated);

        return response()->json([
            'message' => 'Sensor updated successfully',
            'sensor' => $sensor,
        ]);
    }

    public function data(Request $request, Sensor $sensor): JsonResponse
    {
        $validated = $request->validate([
            'temperature' => 'nullable|numeric',
            'heart_rate' => 'nullable|integer',
            'activity_level' => 'nullable|integer',
            'battery_level' => 'nullable|integer|min:0|max:100',
            'metadata' => 'nullable|array',
        ]);

        $this->sensorService->processSensorData($sensor, $validated);

        return response()->json([
            'message' => 'Sensor data received successfully',
        ]);
    }
}
