<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Dispute;
use Illuminate\Http\Request;

class AdminDisputeController extends Controller
{
    public function index(Request $request)
    {
        $query = Dispute::with(['order', 'openedBy', 'againstUser', 'assignedAdmin']);

        if ($request->filled('status')) {
            $request->validate(['status' => 'in:open,in_review,resolved,closed']);
            $query->where('status', $request->status);
        }

        if ($request->filled('order_id')) {
            $request->validate(['order_id' => 'integer']);
            $query->where('order_id', $request->order_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function update(Request $request, $id)
    {
        $dispute = Dispute::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:open,in_review,resolved,closed',
            'assigned_admin_id' => 'nullable|exists:users,id',
            'resolution' => 'nullable|string|max:255',
        ]);

        $dispute->fill($validated);

        if (($validated['status'] ?? null) === 'resolved') {
            $dispute->resolved_at = now();
        }

        $dispute->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'dispute.updated',
            'entity_type' => 'dispute',
            'entity_id' => $dispute->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Dispute updated successfully', 'dispute' => $dispute->load(['order', 'openedBy', 'againstUser', 'assignedAdmin'])]);
    }
}
