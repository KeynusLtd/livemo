<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alert::with(['farm', 'animal', 'sensor']);

        if ($request->has('farm_id')) {
            $query->where('farm_id', $request->farm_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        $alerts = $query->latest()->paginate(20);

        return response()->json($alerts);
    }

    public function show(Alert $alert): JsonResponse
    {
        return response()->json($alert->load(['farm', 'animal', 'sensor']));
    }

    public function acknowledge(Request $request, Alert $alert): JsonResponse
    {
        $alert->acknowledge($request->user()->id);

        return response()->json([
            'message' => 'Alert acknowledged successfully',
            'alert' => $alert,
        ]);
    }

    public function resolve(Request $request, Alert $alert): JsonResponse
    {
        $validated = $request->validate([
            'resolution_notes' => 'nullable|string',
        ]);

        $alert->resolve($request->user()->id, $validated['resolution_notes'] ?? null);

        return response()->json([
            'message' => 'Alert resolved successfully',
            'alert' => $alert,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $farmId = $request->get('farm_id');

        $query = Alert::query();
        if ($farmId) {
            $query->where('farm_id', $farmId);
        }

        $stats = [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'critical' => (clone $query)->where('severity', 'critical')->count(),
            'by_type' => (clone $query)->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type'),
        ];

        return response()->json($stats);
    }
}
