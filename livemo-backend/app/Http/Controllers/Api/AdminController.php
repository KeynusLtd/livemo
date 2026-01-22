<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard overview stats.
     */
    public function stats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_listings' => Listing::where('status', 'active')->count(),
            'total_orders' => Order::count(),
            'revenue' => Order::where('payment_status', 'completed')->sum('total'),
            'recent_users' => User::latest()->take(5)->get(),
            'pending_listings' => Listing::where('status', 'pending_review')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get all users.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    /**
     * Update user status.
     */
    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'nullable|in:active,suspended',
            'is_verified' => 'boolean'
        ]);

        if ($request->has('status')) {
            $user->status = $request->status;
        }

        // If we don't have a status column yet, we might use is_verified or add one.
        // For now let's assume we update is_verified
        if ($request->has('is_verified')) {
            $user->is_verified = $request->is_verified;
            if ($request->is_verified) {
                $user->verified_at = now();
            } else {
                $user->verified_at = null;
            }
        }
        
        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Get all listings.
     */
    public function listings(Request $request)
    {
        $query = Listing::with(['seller', 'listable']);

        if ($request->filled('status')) {
            $request->validate([
                'status' => 'in:draft,active,sold,inactive,pending_review',
            ]);
            $query->where('status', $request->status);
        }

        $listings = $query->latest()->paginate(20);

        return response()->json($listings);
    }

    /**
     * Update listing status.
     */
    public function updateListingStatus(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:draft,active,sold,inactive,pending_review',
        ]);

        $listing->status = $request->status;
        $listing->save();

        return response()->json(['message' => 'Listing updated successfully', 'listing' => $listing]);
    }

    /**
     * Get transactions/orders.
     */
    public function transactions(Request $request)
    {
        $query = Order::with(['buyer', 'seller', 'items.listing']);

        $transactions = $query->latest()->paginate(20);

        return response()->json($transactions);
    }

    /**
     * Get system settings.
     */
    public function settings()
    {
        // This could come from a Settings model or config
        $settings = [
            'commission_rate' => 0.05,
            'site_name' => 'Livemo',
            'maintenance_mode' => false,
        ];

        return response()->json($settings);
    }

    /**
     * Update system settings.
     */
    public function updateSettings(Request $request)
    {
        // Logic to save settings
        return response()->json(['message' => 'Settings updated successfully']);
    }
}
