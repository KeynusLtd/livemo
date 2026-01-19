<?php

namespace App\Models\Marketplace;

use App\Models\Animal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'listable_type',
        'listable_id',
        'seller_id',
        'title',
        'description',
        'price',
        'currency',
        'status',
        'featured',
        'views_count',
        'location',
        'latitude',
        'longitude',
        'delivery_available',
        'delivery_fee',
        'max_delivery_distance_km',
        'tags',
        'published_at',
        'expires_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'featured' => 'boolean',
        'views_count' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'delivery_available' => 'boolean',
        'delivery_fee' => 'decimal:2',
        'max_delivery_distance_km' => 'integer',
        'tags' => 'array',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = ['imageUrl', 'type', 'sellerInfo'];

    public function getImageUrlAttribute()
    {
        return $this->primaryImage ? $this->primaryImage->path : null; // Frontend handles full URL or we can prepend here if needed
    }

    public function getTypeAttribute()
    {
        if (str_contains($this->listable_type, 'Product')) return 'product';
        if (str_contains($this->listable_type, 'Animal')) return 'livestock';
        if (str_contains($this->listable_type, 'Service')) return 'service';
        return 'other';
    }

    public function getSellerInfoAttribute()
    {
        // Return simplified seller info
        return [
            'id' => (string) $this->seller_id,
            'farmName' => $this->sellerProfile ? $this->sellerProfile->business_name : $this->seller->name,
            'location' => $this->location,
            'profileUrl' => null, // Placeholder
        ];
    }

    /**
     * Get the owning listable model (Animal, Product, or Service).
     */
    public function listable()
    {
        return $this->morphTo();
    }

    /**
     * Get the seller.
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the seller profile.
     */
    public function sellerProfile()
    {
        return $this->hasOneThrough(
            SellerProfile::class,
            User::class,
            'id',
            'user_id',
            'seller_id',
            'id'
        );
    }

    /**
     * Get all images for this listing.
     */
    public function images()
    {
        return $this->hasMany(ListingImage::class)->orderBy('order');
    }

    /**
     * Get the primary image.
     */
    public function primaryImage()
    {
        return $this->hasOne(ListingImage::class)->where('is_primary', true);
    }

    /**
     * Get all reviews for this listing.
     */
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    /**
     * Get all cart items for this listing.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get users who saved this listing.
     */
    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_listings');
    }

    /**
     * Increment views count.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Check if listing is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Scope to get only active listings.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }

    /**
     * Scope to get only featured listings.
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope to filter by listable type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('listable_type', $type);
    }

    /**
     * Scope to search by keywords.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
