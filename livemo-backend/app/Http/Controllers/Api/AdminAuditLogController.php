<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminAuditLog::query();

        if ($request->filled('admin_id')) {
            $request->validate(['admin_id' => 'integer']);
            $query->where('admin_id', $request->admin_id);
        }

        if ($request->filled('action')) {
            $request->validate(['action' => 'string|max:255']);
            $query->where('action', $request->action);
        }

        if ($request->filled('entity_type')) {
            $request->validate(['entity_type' => 'string|max:255']);
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('entity_id')) {
            $request->validate(['entity_id' => 'integer']);
            $query->where('entity_id', $request->entity_id);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('action', 'like', "%{$q}%")
                    ->orWhere('entity_type', 'like', "%{$q}%")
                    ->orWhere('ip_address', 'like', "%{$q}%");
            });
        }

        return response()->json($query->orderByDesc('created_at')->paginate(50));
    }
}
