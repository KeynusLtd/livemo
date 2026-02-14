<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\PlatformSetting;
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
     * User growth time-series.
     */
    public function userGrowth(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:7|max:365',
        ]);

        $days = (int) ($validated['days'] ?? 30);

        $rows = User::query()
            ->selectRaw('date(created_at) as day, count(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy(DB::raw('date(created_at)'))
            ->get();

        return response()->json([
            'days' => $days,
            'points' => $rows,
        ]);
    }

    /**
     * Marketplace activity time-series.
     */
    public function marketplaceActivity(Request $request)
    {
        try {
            $validated = $request->validate([
                'days' => 'nullable|integer|min:7|max:365',
            ]);

            $days = (int) ($validated['days'] ?? 30);
            $from = now()->subDays($days);

            $listings = DB::table('listings')
                ->selectRaw('date(created_at) as day, count(*) as listings_created')
                ->where('created_at', '>=', $from)
                ->groupBy(DB::raw('date(created_at)'))
                ->orderBy(DB::raw('date(created_at)'))
                ->get();

            $orders = DB::table('orders')
                ->selectRaw('date(created_at) as day, count(*) as orders_completed, sum(total) as revenue')
                ->where('payment_status', 'completed')
                ->where('created_at', '>=', $from)
                ->groupBy(DB::raw('date(created_at)'))
                ->orderBy(DB::raw('date(created_at)'))
                ->get();

            return response()->json([
                'days' => $days,
                'listings' => $listings,
                'orders' => $orders,
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'message' => 'Failed to compute marketplace activity: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all users.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('verification')) {
            $request->validate([
                'verification' => 'in:pending,verified',
            ]);
            $query->where('is_verified', $request->verification === 'verified');
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

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user.status_updated',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

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

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'listing.status_updated',
            'entity_type' => 'listing',
            'entity_id' => $listing->id,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

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
     * Export transactions as CSV.
     */
    public function exportTransactionsCsv(Request $request)
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $commissionRateRow = \App\Models\PlatformSetting::where('key', 'commission_rate')->first();
        $commissionRate = $commissionRateRow ? (float) $commissionRateRow->value : 0.05;

        $filename = 'transactions_' . $from . '_to_' . $to . '.csv';

        $callback = function () use ($from, $to, $commissionRate) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'order_id',
                'created_at',
                'status',
                'payment_status',
                'currency',
                'total',
                'commission_rate',
                'estimated_commission',
                'buyer_email',
                'seller_email',
            ]);

            Order::query()
                ->with(['buyer:id,email', 'seller:id,email'])
                ->whereBetween('created_at', [$from, $to])
                ->orderByDesc('id')
                ->chunk(500, function ($orders) use ($out, $commissionRate) {
                    foreach ($orders as $order) {
                        $total = (float) $order->total;
                        $commission = $order->payment_status === 'completed' ? ($total * $commissionRate) : 0.0;

                        fputcsv($out, [
                            $order->id,
                            optional($order->created_at)->toDateTimeString(),
                            $order->status,
                            $order->payment_status,
                            $order->currency,
                            number_format($total, 2, '.', ''),
                            $commissionRate,
                            number_format($commission, 2, '.', ''),
                            optional($order->buyer)->email,
                            optional($order->seller)->email,
                        ]);
                    }
                });

            fclose($out);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Get system settings.
     */
    public function settings()
    {
        $defaults = [
            'commission_rate' => 0.05,
            'site_name' => 'Livemo',
            'maintenance_mode' => false,
        ];

        $rows = PlatformSetting::whereIn('key', array_keys($defaults))->get();

        $settings = $defaults;
        foreach ($rows as $row) {
            $settings[$row->key] = $row->value;
        }

        return response()->json($settings);
    }

    /**
     * Update system settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'commission_rate' => 'nullable|numeric|min:0|max:1',
            'site_name' => 'nullable|string|max:255',
            'maintenance_mode' => 'nullable|boolean',
        ]);

        foreach ($validated as $key => $value) {
            PlatformSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => is_bool($value) ? 'boolean' : (is_numeric($value) ? 'number' : 'string'),
                    'updated_by' => $request->user()->id,
                ]
            );
        }

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'settings.updated',
            'entity_type' => 'settings',
            'entity_id' => null,
            'metadata' => ['payload' => $validated],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
