<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthRecord;
use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HealthRecord::with('animal');

        if ($request->has('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        $records = $query->latest()->paginate(20);

        return response()->json($records);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'record_type' => 'required|in:checkup,illness,injury,treatment,observation',
            'temperature' => 'nullable|numeric|min:30|max:45',
            'heart_rate' => 'nullable|integer|min:0',
            'respiratory_rate' => 'nullable|integer|min:0',
            'activity_level' => 'nullable|integer|min:0|max:100',
            'diagnosis' => 'nullable|string',
            'symptoms' => 'nullable|string',
            'treatment' => 'nullable|string',
            'notes' => 'nullable|string',
            'veterinarian' => 'nullable|string',
            'severity' => 'required|in:normal,mild,moderate,severe,critical',
        ]);

        $record = HealthRecord::create($validated);

        return response()->json([
            'message' => 'Health record created successfully',
            'record' => $record->load('animal'),
        ], 201);
    }

    public function show(HealthRecord $healthRecord): JsonResponse
    {
        return response()->json($healthRecord->load('animal'));
    }

    public function update(Request $request, HealthRecord $healthRecord): JsonResponse
    {
        $validated = $request->validate([
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'notes' => 'nullable|string',
            'severity' => 'sometimes|in:normal,mild,moderate,severe,critical',
        ]);

        $healthRecord->update($validated);

        return response()->json([
            'message' => 'Health record updated successfully',
            'record' => $healthRecord,
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $stats = [
            'total_records' => HealthRecord::count(),
            'critical_cases' => HealthRecord::where('severity', 'critical')->count(),
            'recent_checkups' => HealthRecord::where('record_type', 'checkup')
                ->where('created_at', '>=', now()->subDays(30))
                ->count(),
        ];

        return response()->json($stats);
    }
}
