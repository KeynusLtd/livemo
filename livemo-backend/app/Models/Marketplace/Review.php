<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'reviewable_type',
        'reviewable_id',
        'reviewer_id',
        'order_id',
        'rating',
        'title',
        'comment',
        'verified_purchase',
        'helpful_count',
        'is_approved',
    ];

    protected $casts = [
        'rating' => 'integer',
        'verified_purchase' => 'boolean',
        'helpful_count' => 'integer',
        'is_approved' => 'boolean',
    ];

    /**
     * Get the owning reviewable model.
     */
    public function reviewable()
    {
        return $this->morphTo();
    }

    /**
     * Get the reviewer.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the order.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the seller response.
     */
    public function response()
    {
        return $this->hasOne(ReviewResponse::class);
    }

    /**
     * Increment helpful count.
     */
    public function markAsHelpful(): void
    {
        $this->increment('helpful_count');
    }

    /**
     * Scope to get only approved reviews.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope to get verified purchase reviews.
     */
    public function scopeVerified($query)
    {
        return $query->where('verified_purchase', true);
    }

    /**
     * Scope to filter by rating.
     */
    public function scopeWithRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }
}
