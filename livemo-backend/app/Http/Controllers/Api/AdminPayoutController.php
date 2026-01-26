<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Payout;
use Illuminate\Http\Request;

class AdminPayoutController extends Controller
{
    public function index(Request $request)
    {
        $query = Payout::with(['seller', 'requestedBy']);

        if ($request->filled('status')) {
            $request->validate([
                'status' => 'in:requested,processing,paid,failed,cancelled',
            ]);
            $query->where('status', $request->status);
        }

        if ($request->filled('seller_id')) {
            $request->validate([
                'seller_id' => 'integer',
            ]);
            $query->where('seller_id', $request->seller_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'notes' => 'nullable|string',
        ]);

        $payout = Payout::create([
            'seller_id' => $validated['seller_id'],
            'requested_by_admin_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'USD',
            'status' => 'requested',
            'notes' => $validated['notes'] ?? null,
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'payout.requested',
            'entity_type' => 'payout',
            'entity_id' => $payout->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Payout requested successfully',
            'payout' => $payout->load(['seller', 'requestedBy']),
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $payout = Payout::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:requested,processing,paid,failed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $payout->status = $validated['status'];
        if (array_key_exists('notes', $validated)) {
            $payout->notes = $validated['notes'];
        }

        if (in_array($validated['status'], ['paid', 'failed', 'cancelled'], true)) {
            $payout->processed_at = now();
        }

        $payout->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'payout.status_updated',
            'entity_type' => 'payout',
            'entity_id' => $payout->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Payout updated successfully',
            'payout' => $payout->load(['seller', 'requestedBy']),
        ]);
    }
}
