<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\FooterContent;
use Illuminate\Http\Request;

class AdminFooterContentController extends Controller
{
    public function index(Request $request)
    {
        $query = FooterContent::query()->orderBy('order')->orderBy('key');

        if ($request->filled('is_active')) {
            $request->validate(['is_active' => 'in:0,1']);
            $query->where('is_active', (bool) ((int) $request->is_active));
        }

        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:footer_contents,key',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $item = FooterContent::create([
            'key' => $validated['key'],
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'] ?? null,
            'order' => $validated['order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
            'updated_by' => $request->user()->id,
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'footer_content.created',
            'entity_type' => 'footer_content',
            'entity_id' => $item->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Footer content created successfully', 'item' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = FooterContent::findOrFail($id);

        $validated = $request->validate([
            'key' => 'nullable|string|max:255|unique:footer_contents,key,' . $item->id,
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $item->fill($validated);
        $item->updated_by = $request->user()->id;
        $item->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'footer_content.updated',
            'entity_type' => 'footer_content',
            'entity_id' => $item->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Footer content updated successfully', 'item' => $item]);
    }

    public function destroy(Request $request, $id)
    {
        $item = FooterContent::findOrFail($id);
        $item->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'footer_content.deleted',
            'entity_type' => 'footer_content',
            'entity_id' => $id,
            'metadata' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Footer content deleted successfully']);
    }
}
