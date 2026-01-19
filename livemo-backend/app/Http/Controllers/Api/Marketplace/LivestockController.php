<?php

namespace App\Http\Controllers\Api\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Marketplace\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LivestockController extends Controller
{
    /**
     * Display livestock listings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Listing::with([
            'seller',
            'sellerProfile',
            'primaryImage',
            'listable.farm',
            'listable.healthRecords',
            'listable.vaccinations'
        ])
        ->active()
        ->ofType('App\\Models\\Animal');

        // Filter by animal type
        if ($request->has('type')) {
            $query->whereHas('listable', function ($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        // Filter by breed
        if ($request->has('breed')) {
            $query->whereHas('listable', function ($q) use ($request) {
                $q->where('breed', $request->breed);
            });
        }

        // Filter by gender
        if ($request->has('gender')) {
            $query->whereHas('listable', function ($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        // Filter by age range
        if ($request->has('min_age')) {
            $query->whereHas('listable', function ($q) use ($request) {
                $q->where('age_months', '>=', $request->min_age);
            });
        }
        if ($request->has('max_age')) {
            $query->whereHas('listable', function ($q) use ($request) {
                $q->where('age_months', '<=', $request->max_age);
            });
        }

        // Filter by health certified
        if ($request->boolean('health_certified')) {
            $query->whereHas('listable', function ($q) {
                $q->where('status', 'healthy');
            });
        }

        // Price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Location
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $listings = $query->paginate($request->get('per_page', 20));

        return response()->json($listings);
    }

    /**
     * Display the specified livestock listing.
     */
    public function show(string $id): JsonResponse
    {
        $listing = Listing::with([
            'seller.farm',
            'sellerProfile',
            'images',
            'listable.farm',
            'listable.healthRecords',
            'listable.vaccinations',
            'listable.breedingRecords',
            'listable.feedSchedules',
            'reviews.reviewer',
            'reviews.response'
        ])
        ->where('listable_type', 'App\\Models\\Animal')
        ->findOrFail($id);

        // Increment views
        $listing->incrementViews();

        return response()->json($listing);
    }
}
