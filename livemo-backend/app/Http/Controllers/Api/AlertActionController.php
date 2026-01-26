<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\AlertAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertActionController extends Controller
{
    protected function assertAlertOwner(Request $request, Alert $alert): void
    {
        $alert->loadMissing('farm');
        if ($alert->farm && $alert->farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function index(Request $request, Alert $alert): JsonResponse
    {
        $this->assertAlertOwner($request, $alert);

        $actions = $alert->actions()
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json($actions);
    }

    public function store(Request $request, Alert $alert): JsonResponse
    {
        $this->assertAlertOwner($request, $alert);

        $validated = $request->validate([
            'action_type' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $action = AlertAction::create([
            'alert_id' => $alert->id,
            'user_id' => $request->user()->id,
            'action_type' => $validated['action_type'],
            'notes' => $validated['notes'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json([
            'message' => 'Alert action logged successfully',
            'action' => $action->load('user'),
        ], 201);
    }
}
