<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\CartItem;
use App\Models\Marketplace\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Display the user's cart.
     */
    public function index(): JsonResponse
    {
        $cartItems = CartItem::with(['listing.primaryImage', 'listing.seller'])
            ->where('user_id', auth()->id())
            ->get();

        $subtotal = $cartItems->sum('subtotal');

        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'item_count' => $cartItems->count(),
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);

        // Check if listing is active
        if (!$listing->isActive()) {
            return response()->json([
                'message' => 'This listing is not available'
            ], 400);
        }

        // Check if item already in cart
        $cartItem = CartItem::where('user_id', auth()->id())
            ->where('listing_id', $validated['listing_id'])
            ->first();

        if ($cartItem) {
            // Update quantity
            $cartItem->updateQuantity($cartItem->quantity + $validated['quantity']);
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'user_id' => auth()->id(),
                'listing_id' => $validated['listing_id'],
                'quantity' => $validated['quantity'],
                'price_snapshot' => $listing->price,
            ]);
        }

        return response()->json($cartItem, 201);
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::where('user_id', auth()->id())
            ->findOrFail($id);

        $cartItem->updateQuantity($validated['quantity']);

        return response()->json($cartItem);
    }

    /**
     * Remove item from cart.
     */
    public function destroy(string $id): JsonResponse
    {
        $cartItem = CartItem::where('user_id', auth()->id())
            ->findOrFail($id);

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    /**
     * Clear entire cart.
     */
    public function clear(): JsonResponse
    {
        CartItem::where('user_id', auth()->id())->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
