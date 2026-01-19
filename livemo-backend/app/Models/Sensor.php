<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sensor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'device_id',
        'type',
        'animal_id',
        'farm_id',
        'status',
        'battery_level',
        'last_communication',
        'configuration',
        'firmware_version',
        'notes',
    ];

    protected $casts = [
        'battery_level' => 'integer',
        'last_communication' => 'datetime',
        'configuration' => 'array',
    ];

    /**
     * Get the farm that owns the sensor.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the animal assigned to the sensor.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Check if sensor battery is low.
     */
    public function isBatteryLow(): bool
    {
        return $this->battery_level !== null && $this->battery_level < 20;
    }

    /**
     * Check if sensor is offline.
     */
    public function isOffline(): bool
    {
        if (!$this->last_communication) {
            return true;
        }

        return $this->last_communication->diffInMinutes(now()) > 30;
    }

    /**
     * Update last communication timestamp.
     */
    public function updateCommunication(): void
    {
        $this->update(['last_communication' => now()]);
    }
}
