<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\CartItem;
use App\Models\Marketplace\Order;
use App\Models\Marketplace\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Initiate checkout process.
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string',
            'shipping_address.street' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.country' => 'required|string',
            'shipping_address.postal_code' => 'nullable|string',
            'billing_address' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        // Get cart items
        $cartItems = CartItem::with('listing')
            ->where('user_id', auth()->id())
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Calculate totals
        $subtotal = $cartItems->sum('subtotal');
        $deliveryFee = $this->calculateDeliveryFee($cartItems);
        $tax = $this->calculateTax($subtotal);
        $total = $subtotal + $deliveryFee + $tax;

        return response()->json([
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'tax' => $tax,
            'total' => $total,
            'items_count' => $cartItems->count(),
            'shipping_address' => $validated['shipping_address'],
        ]);
    }

    /**
     * Create Stripe payment intent.
     */
    /**
     * Create Stripe payment intent.
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        // Get cart items
        $cartItems = CartItem::with('listing')
            ->where('user_id', auth()->id())
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Calculate total
        $subtotal = $cartItems->sum('subtotal');
        $deliveryFee = $this->calculateDeliveryFee($cartItems);
        $tax = $this->calculateTax($subtotal);
        $total = $subtotal + $deliveryFee + $tax;

        try {
            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => (int) ($total * 100), // Convert to cents
                'currency' => 'usd', // Or env('MARKETPLACE_CURRENCY', 'usd')
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'user_id' => auth()->id(),
                ],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $total,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Confirm order after payment.
     */
    public function confirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'shipping_address' => 'required|array',
            'billing_address' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        // Get cart items
        $cartItems = CartItem::with('listing.seller')
            ->where('user_id', auth()->id())
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Verify Payment Intent with Stripe
        try {
            \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));
            $paymentIntent = \Stripe\PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json(['message' => 'Payment has not been completed'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Payment verification failed', 'error' => $e->getMessage()], 400);
        }

        DB::beginTransaction();
        try {
            // Group cart items by seller
            $itemsBySeller = $cartItems->groupBy('listing.seller_id');

            $orders = [];

            foreach ($itemsBySeller as $sellerId => $items) {
                $subtotal = $items->sum('subtotal');
                $deliveryFee = $this->calculateDeliveryFee($items);
                $tax = $this->calculateTax($subtotal);
                $total = $subtotal + $deliveryFee + $tax;

                // Create order
                $order = Order::create([
                    'buyer_id' => auth()->id(),
                    'seller_id' => $sellerId,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'tax' => $tax,
                    'total' => $total,
                    'payment_method' => 'card',
                    'payment_intent_id' => $validated['payment_intent_id'],
                    'shipping_address' => $validated['shipping_address'],
                    'billing_address' => $validated['billing_address'] ?? $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Create order items
                foreach ($items as $cartItem) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'listing_id' => $cartItem->listing_id,
                        'quantity' => $cartItem->quantity,
                        'price' => $cartItem->price_snapshot,
                        'subtotal' => $cartItem->subtotal,
                        'listing_snapshot' => $cartItem->listing->toArray(),
                    ]);
                }

                // Mark order as paid
                $order->markAsPaid();

                $orders[] = $order;
            }

            // Clear cart
            CartItem::where('user_id', auth()->id())->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order confirmed successfully',
                'orders' => $orders,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Order confirmation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stripe webhook handler.
     */
    public function webhook(Request $request): JsonResponse
    {
        // TODO: Implement Stripe webhook verification and handling
        // This would handle payment confirmations, failures, refunds, etc.

        return response()->json(['received' => true]);
    }

    /**
     * Calculate delivery fee.
     */
    private function calculateDeliveryFee($cartItems): float
    {
        // Simple logic: sum of all delivery fees
        return $cartItems->sum(function ($item) {
            return $item->listing->delivery_fee ?? 0;
        });
    }

    /**
     * Calculate tax.
     */
    private function calculateTax(float $subtotal): float
    {
        // Simple 18% VAT
        return $subtotal * 0.18;
    }
}
