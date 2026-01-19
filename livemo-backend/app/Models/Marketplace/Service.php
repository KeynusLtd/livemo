<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'service_type',
        'duration_minutes',
        'availability_schedule',
        'location_based',
        'max_distance_km',
        'requirements',
        'requires_booking',
        'advance_booking_hours',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'availability_schedule' => 'array',
        'location_based' => 'boolean',
        'max_distance_km' => 'integer',
        'requirements' => 'array',
        'requires_booking' => 'boolean',
        'advance_booking_hours' => 'integer',
    ];

    /**
     * Get the category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the listing for this service.
     */
    public function listing()
    {
        return $this->morphOne(Listing::class, 'listable');
    }

    /**
     * Scope to get only location-based services.
     */
    public function scopeLocationBased($query)
    {
        return $query->where('location_based', true);
    }

    /**
     * Scope to filter by service type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('service_type', $type);
    }
}
