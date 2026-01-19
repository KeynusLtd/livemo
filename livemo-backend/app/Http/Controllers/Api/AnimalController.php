<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    /**
     * Display a listing of animals.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Animal::query();

        // Filter by farm if specified
        if ($request->has('farm_id')) {
            $query->where('farm_id', $request->farm_id);
        }

        // Filter by type if specified
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status if specified
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by tag_id or name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('tag_id', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $animals = $query->with(['farm', 'sensors', 'healthRecords' => function($q) {
            $q->latest()->limit(3);
        }])->paginate(20);

        return response()->json($animals);
    }

    /**
     * Store a newly created animal.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'farm_id' => 'required|exists:farms,id',
            'tag_id' => 'required|string|unique:animals,tag_id',
            'name' => 'nullable|string|max:255',
            'type' => 'required|in:cattle,goats,sheep,poultry,swine,horses,rabbits',
            'breed' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female',
            'birth_date' => 'nullable|date|before:today',
            'weight' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:50',
            'markings' => 'nullable|string',
            'mother_id' => 'nullable|exists:animals,id',
            'father_id' => 'nullable|exists:animals,id',
        ]);

        // Verify farm ownership
        $farm = Farm::findOrFail($validated['farm_id']);
        $this->authorize('update', $farm);

        $animal = Animal::create($validated);

        return response()->json([
            'message' => 'Animal registered successfully',
            'animal' => $animal->load('farm'),
        ], 201);
    }

    /**
     * Display the specified animal.
     */
    public function show(Animal $animal): JsonResponse
    {
        $animal->load([
            'farm',
            'mother',
            'father',
            'sensors',
            'healthRecords' => function($q) {
                $q->latest()->limit(10);
            },
            'vaccinations' => function($q) {
                $q->latest();
            },
            'alerts' => function($q) {
                $q->where('status', 'pending')->latest();
            },
        ]);

        return response()->json($animal);
    }

    /**
     * Update the specified animal.
     */
    public function update(Request $request, Animal $animal): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'breed' => 'nullable|string|max:100',
            'weight' => 'nullable|numeric|min:0',
            'color' => 'nullable|string|max:50',
            'markings' => 'nullable|string',
            'status' => 'sometimes|in:healthy,sick,quarantine,deceased,sold',
            'health_score' => 'sometimes|integer|min:0|max:100',
        ]);

        $animal->update($validated);

        return response()->json([
            'message' => 'Animal updated successfully',
            'animal' => $animal,
        ]);
    }

    /**
     * Remove the specified animal.
     */
    public function destroy(Animal $animal): JsonResponse
    {
        $animal->delete();

        return response()->json([
            'message' => 'Animal deleted successfully',
        ]);
    }

    /**
     * Get health history for an animal.
     */
    public function health(Animal $animal): JsonResponse
    {
        $healthRecords = $animal->healthRecords()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'animal' => $animal,
            'health_records' => $healthRecords,
            'current_health_score' => $animal->health_score,
            'needs_attention' => $animal->needsAttention(),
        ]);
    }

    /**
     * Get activity timeline for an animal.
     */
    public function timeline(Animal $animal): JsonResponse
    {
        $timeline = [];

        // Get recent health records
        $healthRecords = $animal->healthRecords()->latest()->limit(5)->get();
        foreach ($healthRecords as $record) {
            $timeline[] = [
                'type' => 'health_record',
                'date' => $record->created_at,
                'data' => $record,
            ];
        }

        // Get recent vaccinations
        $vaccinations = $animal->vaccinations()->latest()->limit(5)->get();
        foreach ($vaccinations as $vaccination) {
            $timeline[] = [
                'type' => 'vaccination',
                'date' => $vaccination->administered_date,
                'data' => $vaccination,
            ];
        }

        // Get recent alerts
        $alerts = $animal->alerts()->latest()->limit(5)->get();
        foreach ($alerts as $alert) {
            $timeline[] = [
                'type' => 'alert',
                'date' => $alert->created_at,
                'data' => $alert,
            ];
        }

        // Sort timeline by date
        usort($timeline, function($a, $b) {
            return $b['date'] <=> $a['date'];
        });

        return response()->json([
            'animal' => $animal,
            'timeline' => array_slice($timeline, 0, 20),
        ]);
    }
}
