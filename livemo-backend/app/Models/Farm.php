<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Farm extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'location',
        'size',
        'latitude',
        'longitude',
        'contact_phone',
        'contact_email',
        'address',
        'city',
        'country',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'size' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the farm.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all animals for the farm.
     */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /**
     * Get all sensors for the farm.
     */
    public function sensors(): HasMany
    {
        return $this->hasMany(Sensor::class);
    }

    /**
     * Get all pastures for the farm.
     */
    public function pastures(): HasMany
    {
        return $this->hasMany(Pasture::class);
    }

    /**
     * Get all monitoring stations for the farm.
     */
    public function monitoringStations(): HasMany
    {
        return $this->hasMany(MonitoringStation::class);
    }

    /**
     * Get all alerts for the farm.
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Get all feed schedules for the farm.
     */
    public function feedSchedules(): HasMany
    {
        return $this->hasMany(FeedSchedule::class);
    }

    /**
     * Get all breeding records for the farm.
     */
    public function breedingRecords(): HasMany
    {
        return $this->hasMany(BreedingRecord::class);
    }

    /**
     * Get dashboard statistics for the farm.
     */
    public function getDashboardStats(): array
    {
        return [
            'total_animals' => $this->animals()->count(),
            'healthy_animals' => $this->animals()->where('status', 'healthy')->count(),
            'sick_animals' => $this->animals()->where('status', 'sick')->count(),
            'active_sensors' => $this->sensors()->where('status', 'active')->count(),
            'pending_alerts' => $this->alerts()->where('status', 'pending')->count(),
            'pasture_count' => $this->pastures()->count(),
        ];
    }
}
