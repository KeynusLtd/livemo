<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Marketplace\Category;
use App\Models\Marketplace\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmProductController extends Controller
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

        $query = Product::query()
            ->with(['category'])
            ->latest();

        // For now, assume all products belong to the farmer; you can add farm_id to products later if needed
        $products = $query->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request, Farm $farm): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku',
            'category_id' => 'required|exists:marketplace_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'stock_quantity' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'specifications' => 'nullable|array',
            'requires_prescription' => 'sometimes|boolean',
            'expiry_date' => 'nullable|date',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load('category'),
        ], 201);
    }

    public function show(Request $request, Farm $farm, Product $product): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        return response()->json($product->load('category'));
    }

    public function update(Request $request, Farm $farm, Product $product): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $validated = $request->validate([
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'category_id' => 'sometimes|exists:marketplace_categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'stock_quantity' => 'sometimes|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'specifications' => 'nullable|array',
            'requires_prescription' => 'sometimes|boolean',
            'expiry_date' => 'nullable|date',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load('category'),
        ]);
    }

    public function destroy(Request $request, Farm $farm, Product $product): JsonResponse
    {
        $this->assertFarmOwner($request, $farm);

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
