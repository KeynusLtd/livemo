<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Animal;
use App\Models\Marketplace\Category;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FarmListingController extends Controller
{
    protected function assertFarmOwner(Request $request, Farm $farm): void
    {
        if ($farm->user_id !== $request->user()->id) {
            abort(403);
        }
    }

    protected function assertListingOwner(Request $request, Listing $listing): void
    {
        if ($listing->seller_id !== $request->user()->id) {
            abort(403);
        }
    }

    public function index(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $query = Listing::query()
            ->where('seller_id', $request->user()->id)
            ->with(['listable', 'images', 'sellerProfile'])
            ->latest();

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('type')) {
            $type = $request->get('type');
            if ($type === 'livestock') {
                $query->where('listable_type', Animal::class);
            } elseif ($type === 'product') {
                $query->where('listable_type', Product::class);
            }
        }

        $listings = $query->paginate(20);

        return response()->json($listings);
    }

    public function store(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'type' => 'required|in:livestock,product',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'sometimes|string|max:3',
            'location' => 'nullable|string|max:255',
            'delivery_available' => 'sometimes|boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'max_delivery_distance_km' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
            // livestock-specific
            'animal_id' => 'required_if:type,livestock|exists:animals,id',
            // product-specific
            'sku' => 'required_if:type,product|unique:products,sku',
            'category_id' => 'required_if:type,product|exists:marketplace_categories,id',
            'stock_quantity' => 'required_if:type,product|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'specifications' => 'nullable|array',
            'requires_prescription' => 'sometimes|boolean',
            'expiry_date' => 'nullable|date',
        ]);

        $listable = null;
        if ($validated['type'] === 'livestock') {
            $animal = $farm->animals()->findOrFail($validated['animal_id']);
            $listable = $animal;
        } elseif ($validated['type'] === 'product') {
            $product = Product::create([
                'sku' => $validated['sku'],
                'category_id' => $validated['category_id'],
                'name' => $validated['title'],
                'description' => $validated['description'],
                'stock_quantity' => $validated['stock_quantity'],
                'weight' => $validated['weight'] ?? null,
                'brand' => $validated['brand'] ?? null,
                'manufacturer' => $validated['manufacturer'] ?? null,
                'specifications' => $validated['specifications'] ?? null,
                'requires_prescription' => $validated['requires_prescription'] ?? false,
                'expiry_date' => $validated['expiry_date'] ?? null,
            ]);
            $listable = $product;
        }

        $listing = Listing::create([
            'listable_type' => get_class($listable),
            'listable_id' => $listable->id,
            'seller_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'currency' => $validated['currency'] ?? 'USD',
            'status' => 'pending_review',
            'location' => $validated['location'] ?? $farm->location,
            'delivery_available' => $validated['delivery_available'] ?? false,
            'delivery_fee' => $validated['delivery_fee'] ?? 0,
            'max_delivery_distance_km' => $validated['max_delivery_distance_km'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'published_at' => now(),
            'expires_at' => $validated['expires_at'] ?? now()->addDays(30),
        ]);

        return response()->json([
            'message' => 'Listing created successfully',
            'listing' => $listing->load(['listable', 'images']),
        ], 201);
    }

    public function show(Request $request, Farm $farm, Listing $listing): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertListingOwner($request, $listing);

        return response()->json($listing->load(['listable', 'images', 'sellerProfile']));
    }

    public function update(Request $request, Farm $farm, Listing $listing): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertListingOwner($request, $listing);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|max:3',
            'status' => 'sometimes|in:active,pending_review,paused,sold,expired',
            'location' => 'nullable|string|max:255',
            'delivery_available' => 'sometimes|boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'max_delivery_distance_km' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $listing->update($validated);

        return response()->json([
            'message' => 'Listing updated successfully',
            'listing' => $listing->load(['listable', 'images']),
        ]);
    }

    public function destroy(Request $request, Farm $farm, Listing $listing): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);
        $this->assertListingOwner($request, $listing);

        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully',
        ]);
    }
}
