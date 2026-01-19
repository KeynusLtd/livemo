<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.listing', 'seller', 'buyer']);

        // Filter by role (buyer or seller)
        if ($request->get('role') === 'seller') {
            $query->forSeller(auth()->id());
        } else {
            $query->forBuyer(auth()->id());
        }

        // Filter by status
        if ($request->has('status')) {
            $query->withStatus($request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with(['items.listing.images', 'seller', 'buyer'])
            ->findOrFail($id);

        // Authorization check
        if ($order->buyer_id !== auth()->id() && $order->seller_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order);
    }

    /**
     * Update order status (sellers only).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        // Only seller can update status
        if ($order->seller_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:processing,shipped,delivered',
        ]);

        switch ($validated['status']) {
            case 'shipped':
                $order->markAsShipped();
                break;
            case 'delivered':
                $order->markAsDelivered();
                break;
            default:
                $order->update(['status' => $validated['status']]);
        }

        return response()->json($order);
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        // Only buyer can cancel
        if ($order->buyer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $order->cancel($validated['reason'] ?? null);

        return response()->json($order);
    }
}
