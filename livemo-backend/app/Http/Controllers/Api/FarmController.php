<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmController extends Controller
{
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
        $this->authorize('view', $farm);

        $farm->load(['animals', 'sensors', 'pastures', 'monitoringStations']);

        return response()->json($farm);
    }

    /**
     * Update the specified farm.
     */
    public function update(Request $request, Farm $farm): JsonResponse
    {
        $this->authorize('update', $farm);

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
        $this->authorize('delete', $farm);

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
        $this->authorize('view', $farm);

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
        $this->authorize('view', $farm);

        $stats = $farm->getDashboardStats();

        return response()->json([
            'farm' => $farm,
            'statistics' => $stats,
        ]);
    }
}
