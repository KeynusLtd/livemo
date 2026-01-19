<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'listing_id',
        'quantity',
        'price_snapshot',
        'options',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_snapshot' => 'decimal:2',
        'options' => 'array',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the listing.
     */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * Get the subtotal for this cart item.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->quantity * $this->price_snapshot;
    }

    /**
     * Update quantity.
     */
    public function updateQuantity(int $quantity): void
    {
        $this->quantity = $quantity;
        $this->save();
    }
}
