<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AdminAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::query();

        if ($request->filled('is_active')) {
            $request->validate(['is_active' => 'in:0,1']);
            $query->where('is_active', (bool) ((int) $request->is_active));
        }

        if ($request->filled('level')) {
            $request->validate(['level' => 'in:info,success,warning,error']);
            $query->where('level', $request->level);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'level' => 'nullable|in:info,success,warning,error',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'level' => $validated['level'] ?? 'info',
            'is_active' => $validated['is_active'] ?? true,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'announcement.created',
            'entity_type' => 'announcement',
            'entity_id' => $announcement->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Announcement created successfully', 'announcement' => $announcement], 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'level' => 'nullable|in:info,success,warning,error',
            'is_active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $announcement->fill($validated);
        $announcement->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'announcement.updated',
            'entity_type' => 'announcement',
            'entity_id' => $announcement->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Announcement updated successfully', 'announcement' => $announcement]);
    }

    public function destroy(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'announcement.deleted',
            'entity_type' => 'announcement',
            'entity_id' => $id,
            'metadata' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}
