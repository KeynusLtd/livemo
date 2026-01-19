<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListingImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'path',
        'thumbnail_path',
        'order',
        'is_primary',
        'caption',
        'size_bytes',
        'mime_type',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_primary' => 'boolean',
        'size_bytes' => 'integer',
    ];

    /**
     * Get the listing that owns the image.
     */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * Get the full URL for the image.
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }

    /**
     * Get the full URL for the thumbnail.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path ? asset('storage/' . $this->thumbnail_path) : null;
    }
}
