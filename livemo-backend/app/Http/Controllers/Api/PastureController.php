<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Pasture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PastureController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function assertPastureInFarm(Farm $farm, Pasture $pasture): void
    {
        if ((int) $pasture->farm_id !== (int) $farm->id) {
            abort(404);
        }
    }

    public function index(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $query = $farm->pastures()->withCount('currentAnimals');

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOL));
        }

        $pastures = $query->orderBy('name')->paginate(20);

        return response()->json($pastures);
    }

    public function store(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'size' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:0',
            'quality' => 'sometimes|in:excellent,good,fair,poor',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'boundaries' => 'nullable|array',
            'last_rotation' => 'nullable|date',
            'next_rotation' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $pasture = Pasture::create([
            ...$validated,
            'farm_id' => $farm->id,
        ]);

        return response()->json([
            'message' => 'Pasture created successfully',
            'pasture' => $pasture,
        ], 201);
    }

    public function show(Request $request, Farm $farm, Pasture $pasture): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertPastureInFarm($farm, $pasture);

        $pasture->load(['currentAnimals', 'allAnimals']);

        return response()->json($pasture);
    }

    public function update(Request $request, Farm $farm, Pasture $pasture): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertPastureInFarm($farm, $pasture);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'size' => 'nullable|numeric|min:0',
            'capacity' => 'nullable|integer|min:0',
            'quality' => 'sometimes|in:excellent,good,fair,poor',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'boundaries' => 'nullable|array',
            'last_rotation' => 'nullable|date',
            'next_rotation' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $pasture->update($validated);

        return response()->json([
            'message' => 'Pasture updated successfully',
            'pasture' => $pasture,
        ]);
    }

    public function assignAnimal(Request $request, Farm $farm, Pasture $pasture): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertPastureInFarm($farm, $pasture);

        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
            'notes' => 'nullable|string',
        ]);

        $animal = $farm->animals()->findOrFail($validated['animal_id']);

        // Remove animal from other current pastures (enforce single current pasture)
        $animal->pastureHistory()
            ->wherePivot('is_current', true)
            ->get()
            ->each(function ($p) use ($animal) {
                $p->removeAnimal($animal->id);
            });

        $pasture->assignAnimal($animal->id, $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Animal assigned to pasture',
            'pasture' => $pasture->load('currentAnimals'),
        ]);
    }

    public function removeAnimal(Request $request, Farm $farm, Pasture $pasture): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertPastureInFarm($farm, $pasture);

        $validated = $request->validate([
            'animal_id' => 'required|exists:animals,id',
        ]);

        $animal = $farm->animals()->findOrFail($validated['animal_id']);

        $pasture->removeAnimal($animal->id);

        return response()->json([
            'message' => 'Animal removed from pasture',
            'pasture' => $pasture->load('currentAnimals'),
        ]);
    }

    public function destroy(Request $request, Farm $farm, Pasture $pasture): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertPastureInFarm($farm, $pasture);

        $pasture->delete();

        return response()->json([
            'message' => 'Pasture deleted successfully',
        ]);
    }
}
