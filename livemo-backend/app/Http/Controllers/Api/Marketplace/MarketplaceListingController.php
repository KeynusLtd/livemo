<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketplaceListingController extends Controller
{
    /**
     * Display a listing of marketplace items.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Listing::with(['seller', 'sellerProfile', 'primaryImage', 'listable'])
            ->active();

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Filter by featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['created_at', 'price', 'views_count', 'title'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $listings = $query->paginate($request->get('per_page', 20));

        return response()->json($listings);
    }

    /**
     * Display the specified listing.
     */
    public function show(string $id): JsonResponse
    {
        $listing = Listing::with([
            'seller',
            'sellerProfile',
            'images',
            'listable',
            'reviews.reviewer',
            'reviews.response'
        ])->findOrFail($id);

        // Increment views
        $listing->incrementViews();

        return response()->json($listing);
    }

    /**
     * Store a newly created listing.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listable_type' => 'required|string',
            'listable_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'location' => 'nullable|string',
            'delivery_available' => 'boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'tags' => 'nullable|array',
        ]);

        $validated['seller_id'] = auth()->id();
        $validated['status'] = 'draft';

        $listing = Listing::create($validated);

        return response()->json($listing, 201);
    }

    /**
     * Update the specified listing.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        // Authorization check
        if ($listing->seller_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,active,sold,inactive',
            'location' => 'nullable|string',
            'delivery_available' => 'boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'tags' => 'nullable|array',
        ]);

        $listing->update($validated);

        return response()->json($listing);
    }

    /**
     * Remove the specified listing.
     */
    public function destroy(string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        // Authorization check
        if ($listing->seller_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted successfully']);
    }
}
