<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'description',
        'logo',
        'verification_status',
        'verification_documents',
        'verified_at',
        'rating_average',
        'rating_count',
        'total_sales',
        'response_time_hours',
        'bank_account_encrypted',
        'tax_id',
        'business_hours',
        'website',
        'social_links',
        'is_active',
    ];

    protected $casts = [
        'verification_documents' => 'array',
        'verified_at' => 'datetime',
        'rating_average' => 'decimal:2',
        'rating_count' => 'integer',
        'total_sales' => 'integer',
        'response_time_hours' => 'decimal:2',
        'business_hours' => 'array',
        'social_links' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the seller profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all listings for this seller.
     */
    public function listings()
    {
        return $this->hasMany(Listing::class, 'seller_id', 'user_id');
    }

    /**
     * Get all orders as seller.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'seller_id', 'user_id');
    }

    /**
     * Scope to get only verified sellers.
     */
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    /**
     * Scope to get only active sellers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if seller is verified.
     */
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    /**
     * Update seller rating.
     */
    public function updateRating(int $newRating): void
    {
        $totalRating = ($this->rating_average * $this->rating_count) + $newRating;
        $this->rating_count++;
        $this->rating_average = $totalRating / $this->rating_count;
        $this->save();
    }
}
