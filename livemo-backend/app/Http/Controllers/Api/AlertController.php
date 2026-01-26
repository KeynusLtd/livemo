<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\AlertAction;
use App\Models\Farm;
use App\Events\AlertUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    protected function userFarmIds(Request $request)
    {
        return Farm::where('user_id', $request->user()->id)->pluck('id');
    }

    public function index(Request $request): JsonResponse
    {
        $farmIds = $this->userFarmIds($request);
        $query = Alert::with(['farm', 'animal', 'sensor'])->whereIn('farm_id', $farmIds);

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

    public function show(Request $request, Alert $alert): JsonResponse
    {
        $alert->loadMissing('farm');
        if ($alert->farm && $alert->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json($alert->load(['farm', 'animal', 'sensor']));
    }

    public function acknowledge(Request $request, Alert $alert): JsonResponse
    {
        if ($alert->farm && $alert->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $alert->acknowledge($request->user()->id);

        AlertAction::create([
            'alert_id' => $alert->id,
            'user_id' => $request->user()->id,
            'action_type' => 'acknowledged',
        ]);

        event(new AlertUpdated($alert, 'acknowledged'));

        return response()->json([
            'message' => 'Alert acknowledged successfully',
            'alert' => $alert,
        ]);
    }

    public function resolve(Request $request, Alert $alert): JsonResponse
    {
        if ($alert->farm && $alert->farm->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'resolution_notes' => 'nullable|string',
        ]);

        $alert->resolve($request->user()->id, $validated['resolution_notes'] ?? null);

        AlertAction::create([
            'alert_id' => $alert->id,
            'user_id' => $request->user()->id,
            'action_type' => 'resolved',
            'notes' => $validated['resolution_notes'] ?? null,
        ]);

        event(new AlertUpdated($alert, 'resolved'));

        return response()->json([
            'message' => 'Alert resolved successfully',
            'alert' => $alert,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $farmId = $request->get('farm_id');

        $farmIds = $this->userFarmIds($request);
        $query = Alert::query()->whereIn('farm_id', $farmIds);
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
