<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\ContentPage;
use Illuminate\Http\Request;

class AdminContentPageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContentPage::query();

        if ($request->filled('is_published')) {
            $request->validate(['is_published' => 'in:0,1']);
            $query->where('is_published', (bool) ((int) $request->is_published));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function show(Request $request, $slug)
    {
        $page = ContentPage::where('slug', $slug)->firstOrFail();
        return response()->json($page);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:255|unique:content_pages,slug',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'is_published' => 'nullable|boolean',
        ]);

        $page = ContentPage::create([
            'slug' => $validated['slug'],
            'title' => $validated['title'],
            'body' => $validated['body'],
            'is_published' => $validated['is_published'] ?? false,
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
            'updated_by' => $request->user()->id,
        ]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'content_page.created',
            'entity_type' => 'content_page',
            'entity_id' => $page->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Content page created successfully', 'page' => $page], 201);
    }

    public function update(Request $request, $id)
    {
        $page = ContentPage::findOrFail($id);

        $validated = $request->validate([
            'slug' => 'nullable|string|max:255|unique:content_pages,slug,' . $page->id,
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string',
            'is_published' => 'nullable|boolean',
        ]);

        $page->fill($validated);
        $page->updated_by = $request->user()->id;

        if (array_key_exists('is_published', $validated)) {
            if ($validated['is_published'] && !$page->published_at) {
                $page->published_at = now();
            }
            if (!$validated['is_published']) {
                $page->published_at = null;
            }
        }

        $page->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'content_page.updated',
            'entity_type' => 'content_page',
            'entity_id' => $page->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Content page updated successfully', 'page' => $page]);
    }

    public function destroy(Request $request, $id)
    {
        $page = ContentPage::findOrFail($id);
        $page->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'content_page.deleted',
            'entity_type' => 'content_page',
            'entity_id' => $id,
            'metadata' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Content page deleted successfully']);
    }
}
