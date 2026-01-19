<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'listing_id',
        'quantity',
        'price',
        'subtotal',
        'listing_snapshot',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'listing_snapshot' => 'array',
    ];

    /**
     * Get the order.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the listing.
     */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * Calculate subtotal.
     */
    public function calculateSubtotal(): float
    {
        return $this->quantity * $this->price;
    }
}
