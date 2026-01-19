<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'user_id',
        'response',
    ];

    /**
     * Get the review.
     */
    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    /**
     * Get the user who responded.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
