<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnimalCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnimalCatalogController extends Controller
{
    public function types(): JsonResponse
    {
        $types = AnimalCatalog::query()
            ->where('is_active', true)
            ->distinct()
            ->orderBy('type')
            ->pluck('type')
            ->values();

        return response()->json([
            'types' => $types,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = AnimalCatalog::query()->where('is_active', true);

        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(1, min($perPage, 500));

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('type')->orderBy('name')->paginate($perPage);

        return response()->json($items);
    }

    public function show(AnimalCatalog $animalCatalog): JsonResponse
    {
        if (!$animalCatalog->is_active) {
            abort(404);
        }

        return response()->json($animalCatalog);
    }
}
