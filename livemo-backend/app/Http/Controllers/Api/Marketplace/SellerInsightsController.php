<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerInsightsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $from = $validated['from'] ?? now()->startOfMonth()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $sellerId = $request->user()->id;

        $ordersQuery = Order::query()
            ->where('seller_id', $sellerId)
            ->whereBetween('created_at', [$from, $to]);

        $ordersCount = (clone $ordersQuery)->count();
        $paidRevenue = (clone $ordersQuery)->where('payment_status', 'completed')->sum('total');

        $byStatus = (clone $ordersQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $listingsQuery = Listing::query()->where('seller_id', $sellerId);

        $listingsTotal = (clone $listingsQuery)->count();
        $activeListings = (clone $listingsQuery)->where('status', 'active')->count();

        $topListings = (clone $listingsQuery)
            ->orderByDesc('views_count')
            ->limit(5)
            ->get();

        return response()->json([
            'range' => ['from' => $from, 'to' => $to],
            'orders_count' => (int) $ordersCount,
            'revenue_total' => (float) $paidRevenue,
            'orders_by_status' => $byStatus,
            'listings_total' => (int) $listingsTotal,
            'listings_active' => (int) $activeListings,
            'top_listings' => $topListings,
        ]);
    }

    public function revenueTrend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $sellerId = $request->user()->id;

        $rows = Order::query()
            ->selectRaw("date(created_at) as day, sum(total) as revenue")
            ->where('seller_id', $sellerId)
            ->where('payment_status', 'completed')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy(DB::raw('date(created_at)'))
            ->get();

        return response()->json([
            'days' => $days,
            'points' => $rows,
        ]);
    }
}
