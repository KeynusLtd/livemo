<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Review;
use App\Models\Marketplace\ReviewResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['reviewer', 'response'])->approved();

        // Filter by reviewable
        if ($request->has('reviewable_type') && $request->has('reviewable_id')) {
            $query->where('reviewable_type', $request->reviewable_type)
                  ->where('reviewable_id', $request->reviewable_id);
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->withRating($request->rating);
        }

        // Filter verified purchases
        if ($request->boolean('verified_only')) {
            $query->verified();
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($reviews);
    }

    /**
     * Store a new review.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reviewable_type' => 'required|string',
            'reviewable_id' => 'required|integer',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $validated['reviewer_id'] = auth()->id();
        
        // Check if this is a verified purchase
        if (isset($validated['order_id'])) {
            $order = \App\Models\Marketplace\Order::find($validated['order_id']);
            $validated['verified_purchase'] = $order && $order->buyer_id === auth()->id();
        }

        $review = Review::create($validated);

        return response()->json($review, 201);
    }

    /**
     * Update a review.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        // Authorization check
        if ($review->reviewer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    /**
     * Delete a review.
     */
    public function destroy(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        // Authorization check
        if ($review->reviewer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    /**
     * Seller response to review.
     */
    public function respond(Request $request, string $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'response' => 'required|string',
        ]);

        // Check if user is the seller of the reviewed item
        // This would need more complex logic based on reviewable type

        $response = ReviewResponse::create([
            'review_id' => $review->id,
            'user_id' => auth()->id(),
            'response' => $validated['response'],
        ]);

        return response()->json($response, 201);
    }

    /**
     * Mark review as helpful.
     */
    public function markHelpful(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->markAsHelpful();

        return response()->json($review);
    }
}
