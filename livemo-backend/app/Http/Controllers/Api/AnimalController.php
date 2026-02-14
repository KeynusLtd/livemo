<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\AnimalCatalog;
use App\Models\BreedingRecord;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimalController extends Controller
{
    protected function userFarmIds(Request $request)
    {
        return Farm::where('user_id', $request->user()->id)->pluck('id');
    }

    /**
     * Display a listing of animals.
     */
    public function index(Request $request): JsonResponse
    {
        $farmIds = $this->userFarmIds($request);
        $query = Animal::query()->whereIn('farm_id', $farmIds);

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
            'catalog_id' => 'required|exists:animal_catalogs,id',
            'tag_id' => 'required|string|unique:animals,tag_id',
            'name' => 'nullable|string|max:255',
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
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $catalog = AnimalCatalog::query()->where('id', $validated['catalog_id'])->where('is_active', true)->first();
        if (!$catalog) {
            return response()->json([
                'message' => 'Invalid catalog animal selected',
            ], 422);
        }

        $validated['type'] = $catalog->type;
        $validated['breed'] = $catalog->breed;

        $animal = Animal::create($validated);

        return response()->json([
            'message' => 'Animal registered successfully',
            'animal' => $animal->load(['farm', 'catalog']),
        ], 201);
    }

    /**
     * Display the specified animal.
     */
    public function show(Request $request, Animal $animal): JsonResponse
    {
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $animal->load([
            'farm',
            'catalog',
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
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

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
    public function destroy(Request $request, Animal $animal): JsonResponse
    {
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $animal->delete();

        return response()->json([
            'message' => 'Animal deleted successfully',
        ]);
    }

    /**
     * Get health history for an animal.
     */
    public function health(Request $request, Animal $animal): JsonResponse
    {
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

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
    public function timeline(Request $request, Animal $animal): JsonResponse
    {
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

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

    /**
     * Get breeding records for an animal (as mother or father).
     */
    public function breedingRecords(Request $request, Animal $animal): JsonResponse
    {
        $animal->loadMissing(['farm', 'catalog']);
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $records = BreedingRecord::query()
            ->where('farm_id', $animal->farm_id)
            ->where(function ($q) use ($animal) {
                $q->where('mother_id', $animal->id)
                    ->orWhere('father_id', $animal->id);
            })
            ->with(['mother', 'father'])
            ->latest('breeding_date')
            ->paginate(20);

        return response()->json($records);
    }
}
