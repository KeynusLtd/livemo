<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Marketplace\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FarmOrderController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function index(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $userId = $request->user()->id;

        $query = Order::query()
            ->where(function ($q) use ($farm, $userId) {
                $q->where('seller_id', $userId)
                    ->orWhere('farm_id', $farm->id);
            })
            ->with(['buyer', 'items.listing', 'items.listable']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->get('payment_status'));
        }

        $orders = $query->latest()->paginate(20);

        return response()->json($orders);
    }

    public function show(Request $request, Farm $farm, Order $order): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        if ($order->seller_id !== $request->user()->id) {
            abort(404);
        }

        return response()->json($order->load(['buyer', 'items.listing', 'items.listable']));
    }

    public function earnings(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $userId = $request->user()->id;

        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->toDateString();
        $to = $validated['to'] ?? now()->toDateString();

        $ordersQuery = Order::query()
            ->where(function ($q) use ($farm, $userId) {
                $q->where('seller_id', $userId)
                    ->orWhere('farm_id', $farm->id);
            })
            ->whereBetween('created_at', [$from, $to]);

        $ordersCount = (clone $ordersQuery)->count();
        $paidRevenue = (clone $ordersQuery)->where('payment_status', 'completed')->sum('total');

        $byStatus = (clone $ordersQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $byPaymentStatus = (clone $ordersQuery)
            ->selectRaw('payment_status, count(*) as count')
            ->groupBy('payment_status')
            ->pluck('count', 'payment_status');

        return response()->json([
            'range' => ['from' => $from, 'to' => $to],
            'orders_count' => (int) $ordersCount,
            'revenue_total' => (float) $paidRevenue,
            'orders_by_status' => $byStatus,
            'orders_by_payment_status' => $byPaymentStatus,
        ]);
    }
}
