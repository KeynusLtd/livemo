<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\BreedingRecord;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BreedingRecordController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function assertRecordInFarm(Farm $farm, BreedingRecord $breedingRecord): void
    {
        if ((int) $breedingRecord->farm_id !== (int) $farm->id) {
            abort(404);
        }
    }

    public function index(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $query = BreedingRecord::query()
            ->where('farm_id', $farm->id)
            ->with(['mother', 'father']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('mother_id')) {
            $query->where('mother_id', $request->get('mother_id'));
        }

        $records = $query->latest('breeding_date')->paginate(20);

        return response()->json($records);
    }

    public function store(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'mother_id' => 'required|exists:animals,id',
            'father_id' => 'nullable|exists:animals,id',
            'method' => 'required|in:natural,artificial_insemination,embryo_transfer',
            'breeding_date' => 'required|date',
            'expected_birth_date' => 'nullable|date',
            'actual_birth_date' => 'nullable|date',
            'status' => 'sometimes|in:planned,bred,confirmed_pregnant,not_pregnant,birthed,aborted',
            'offspring_count' => 'nullable|integer|min:0',
            'offspring_ids' => 'nullable|array',
            'complications' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $mother = $farm->animals()->findOrFail($validated['mother_id']);
        $father = null;
        if (!empty($validated['father_id'])) {
            $father = $farm->animals()->findOrFail($validated['father_id']);
        }

        $record = BreedingRecord::create([
            ...$validated,
            'farm_id' => $farm->id,
            'mother_id' => $mother->id,
            'father_id' => $father?->id,
        ]);

        if (empty($validated['expected_birth_date'])) {
            $record->loadMissing('mother');
            $record->calculateExpectedBirthDate();
        }

        return response()->json([
            'message' => 'Breeding record created successfully',
            'breeding_record' => $record->load(['mother', 'father']),
        ], 201);
    }

    public function show(Request $request, Farm $farm, BreedingRecord $breedingRecord): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertRecordInFarm($farm, $breedingRecord);

        return response()->json($breedingRecord->load(['mother', 'father']));
    }

    public function update(Request $request, Farm $farm, BreedingRecord $breedingRecord): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertRecordInFarm($farm, $breedingRecord);

        $validated = $request->validate([
            'father_id' => 'nullable|exists:animals,id',
            'method' => 'sometimes|in:natural,artificial_insemination,embryo_transfer',
            'breeding_date' => 'nullable|date',
            'expected_birth_date' => 'nullable|date',
            'actual_birth_date' => 'nullable|date',
            'status' => 'sometimes|in:planned,bred,confirmed_pregnant,not_pregnant,birthed,aborted',
            'pregnancy_days' => 'nullable|integer|min:0',
            'is_successful' => 'nullable|boolean',
            'offspring_count' => 'nullable|integer|min:0',
            'offspring_ids' => 'nullable|array',
            'complications' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (array_key_exists('father_id', $validated) && $validated['father_id'] !== null) {
            $farm->animals()->findOrFail($validated['father_id']);
        }

        $breedingRecord->update($validated);

        // Keep pregnancy_days updated if pregnant
        if ($breedingRecord->status === 'confirmed_pregnant') {
            $breedingRecord->updatePregnancyDays();
        }

        return response()->json([
            'message' => 'Breeding record updated successfully',
            'breeding_record' => $breedingRecord->load(['mother', 'father']),
        ]);
    }

    public function reminders(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $from = now()->toDateString();
        $to = now()->addDays($days)->toDateString();

        $dueBirths = BreedingRecord::query()
            ->where('farm_id', $farm->id)
            ->whereIn('status', ['confirmed_pregnant', 'bred'])
            ->whereNotNull('expected_birth_date')
            ->whereBetween('expected_birth_date', [$from, $to])
            ->with(['mother'])
            ->orderBy('expected_birth_date')
            ->limit(50)
            ->get();

        $overdueBirths = BreedingRecord::query()
            ->where('farm_id', $farm->id)
            ->whereNull('actual_birth_date')
            ->whereNotNull('expected_birth_date')
            ->where('expected_birth_date', '<', now()->subDays(7)->toDateString())
            ->with(['mother'])
            ->orderBy('expected_birth_date')
            ->limit(50)
            ->get();

        return response()->json([
            'range_days' => $days,
            'due_births' => $dueBirths,
            'overdue_births' => $overdueBirths,
        ]);
    }

    public function destroy(Request $request, Farm $farm, BreedingRecord $breedingRecord): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertRecordInFarm($farm, $breedingRecord);

        $breedingRecord->delete();

        return response()->json([
            'message' => 'Breeding record deleted successfully',
        ]);
    }
}
