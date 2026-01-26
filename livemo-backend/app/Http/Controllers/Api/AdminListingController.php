<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Marketplace\Listing;
use Illuminate\Http\Request;

class AdminListingController extends Controller
{
    public function destroy(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);
        $listing->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'listing.deleted',
            'entity_type' => 'listing',
            'entity_id' => $id,
            'metadata' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Listing removed successfully']);
    }

    public function feature(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        $validated = $request->validate([
            'featured' => 'required|boolean',
        ]);

        $listing->featured = $validated['featured'];
        $listing->save();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'listing.feature_updated',
            'entity_type' => 'listing',
            'entity_id' => $listing->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Listing feature updated successfully', 'listing' => $listing]);
    }
}
