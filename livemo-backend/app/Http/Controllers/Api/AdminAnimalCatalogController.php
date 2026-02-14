<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimalCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnimalCatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AnimalCatalog::query();

        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(1, min($perPage, 500));

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $v = $request->is_active;
            $query->where('is_active', filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest('id')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cattle,goats,sheep,poultry,swine,horses,rabbits',
            'breed' => 'nullable|string|max:100',
            'default_gender' => 'nullable|in:male,female',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $validated['created_by'] = $request->user()->id;

        $item = AnimalCatalog::create($validated);

        return response()->json([
            'message' => 'Catalog animal created successfully',
            'item' => $item,
        ], 201);
    }

    public function update(Request $request, AnimalCatalog $animalCatalog): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:cattle,goats,sheep,poultry,swine,horses,rabbits',
            'breed' => 'nullable|string|max:100',
            'default_gender' => 'nullable|in:male,female',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $animalCatalog->update($validated);

        return response()->json([
            'message' => 'Catalog animal updated successfully',
            'item' => $animalCatalog,
        ]);
    }

    public function destroy(AnimalCatalog $animalCatalog): JsonResponse
    {
        $animalCatalog->delete();

        return response()->json([
            'message' => 'Catalog animal deleted successfully',
        ]);
    }
}
