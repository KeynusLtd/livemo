<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'sku',
        'stock_quantity',
        'weight',
        'dimensions',
        'brand',
        'manufacturer',
        'specifications',
        'requires_prescription',
        'expiry_date',
    ];

    protected $casts = [
        'stock_quantity' => 'integer',
        'weight' => 'decimal:2',
        'dimensions' => 'array',
        'specifications' => 'array',
        'requires_prescription' => 'boolean',
        'expiry_date' => 'date',
    ];

    /**
     * Get the category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the listing for this product.
     */
    public function listing()
    {
        return $this->morphOne(Listing::class, 'listable');
    }

    /**
     * Check if product is in stock.
     */
    public function inStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Decrease stock quantity.
     */
    public function decreaseStock(int $quantity): void
    {
        $this->stock_quantity -= $quantity;
        $this->save();
    }

    /**
     * Increase stock quantity.
     */
    public function increaseStock(int $quantity): void
    {
        $this->stock_quantity += $quantity;
        $this->save();
    }

    /**
     * Scope to get only in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}
