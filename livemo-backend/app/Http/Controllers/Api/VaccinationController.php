<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Vaccination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VaccinationController extends Controller
{
    protected function assertAnimalOwner(Request $request, Animal $animal): void
    {
        $animal->loadMissing('farm');
        if ($animal->farm && $animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function assertVaccinationOwner(Request $request, Vaccination $vaccination): void
    {
        $vaccination->loadMissing('animal.farm');
        if ($vaccination->animal && $vaccination->animal->farm && $vaccination->animal->farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function index(Request $request, Animal $animal): JsonResponse
    {
        $this->assertAnimalOwner($request, $animal);

        $vaccinations = $animal->vaccinations()
            ->latest('administered_date')
            ->paginate(20);

        return response()->json($vaccinations);
    }

    public function store(Request $request, Animal $animal): JsonResponse
    {
        $this->assertAnimalOwner($request, $animal);

        $validated = $request->validate([
            'vaccine_name' => 'required|string|max:255',
            'vaccine_type' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'administered_date' => 'required|date',
            'next_due_date' => 'nullable|date|after_or_equal:administered_date',
            'administered_by' => 'nullable|string|max:255',
            'dosage' => 'nullable|numeric|min:0',
            'dosage_unit' => 'nullable|string|max:50',
            'administration_route' => 'nullable|string|max:50',
            'side_effects' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_booster' => 'sometimes|boolean',
            'previous_vaccination_id' => 'nullable|exists:vaccinations,id',
        ]);

        if (!empty($validated['previous_vaccination_id'])) {
            $prev = $animal->vaccinations()->find($validated['previous_vaccination_id']);
            if (!$prev) {
                abort(422, 'Previous vaccination must belong to the same animal.');
            }
        }

        $vaccination = Vaccination::create([
            ...$validated,
            'animal_id' => $animal->id,
        ]);

        return response()->json([
            'message' => 'Vaccination created successfully',
            'vaccination' => $vaccination,
        ], 201);
    }

    public function update(Request $request, Vaccination $vaccination): JsonResponse
    {
        $this->assertVaccinationOwner($request, $vaccination);

        $validated = $request->validate([
            'vaccine_name' => 'sometimes|string|max:255',
            'vaccine_type' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'administered_date' => 'sometimes|date',
            'next_due_date' => 'nullable|date',
            'administered_by' => 'nullable|string|max:255',
            'dosage' => 'nullable|numeric|min:0',
            'dosage_unit' => 'nullable|string|max:50',
            'administration_route' => 'nullable|string|max:50',
            'side_effects' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_booster' => 'sometimes|boolean',
            'previous_vaccination_id' => 'nullable|exists:vaccinations,id',
        ]);

        if (array_key_exists('previous_vaccination_id', $validated) && $validated['previous_vaccination_id'] !== null) {
            $vaccination->loadMissing('animal');
            $prev = $vaccination->animal?->vaccinations()->find($validated['previous_vaccination_id']);
            if (!$prev) {
                abort(422, 'Previous vaccination must belong to the same animal.');
            }
        }

        $vaccination->update($validated);

        return response()->json([
            'message' => 'Vaccination updated successfully',
            'vaccination' => $vaccination,
        ]);
    }

    public function destroy(Request $request, Vaccination $vaccination): JsonResponse
    {
        $this->assertVaccinationOwner($request, $vaccination);

        $vaccination->delete();

        return response()->json([
            'message' => 'Vaccination deleted successfully',
        ]);
    }
}
