<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\ListingReport;
use Illuminate\Http\Request;

class AdminListingReportController extends Controller
{
    public function index(Request $request)
    {
        $query = ListingReport::with(['listing', 'reporter', 'assignedAdmin']);

        if ($request->filled('status')) {
            $request->validate(['status' => 'in:open,reviewing,resolved,dismissed']);
            $query->where('status', $request->status);
        }

        if ($request->filled('listing_id')) {
            $request->validate(['listing_id' => 'integer']);
            $query->where('listing_id', $request->listing_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
        ]);

        $report = ListingReport::create([
            'listing_id' => $validated['listing_id'],
            'reporter_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'open',
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'listing_report.created',
            'entity_type' => 'listing_report',
            'entity_id' => $report->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Report created successfully', 'report' => $report], 201);
    }

    public function update(Request $request, $id)
    {
        $report = ListingReport::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:open,reviewing,resolved,dismissed',
            'assigned_admin_id' => 'nullable|exists:users,id',
        ]);

        $report->fill($validated);

        if (($validated['status'] ?? null) && in_array($validated['status'], ['resolved', 'dismissed'], true)) {
            $report->resolved_at = now();
        }

        $report->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'listing_report.updated',
            'entity_type' => 'listing_report',
            'entity_id' => $report->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Report updated successfully', 'report' => $report->load(['listing', 'reporter', 'assignedAdmin'])]);
    }
}
