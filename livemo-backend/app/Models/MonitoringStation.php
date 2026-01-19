<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MonitoringStation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'station_id',
        'name',
        'description',
        'type',
        'latitude',
        'longitude',
        'coverage_area',
        'coverage_capacity',
        'status',
        'camera_config',
        'ai_models',
        'firmware_version',
        'power_level',
        'last_communication',
        'environmental_data',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'coverage_area' => 'array',
        'coverage_capacity' => 'integer',
        'camera_config' => 'array',
        'ai_models' => 'array',
        'power_level' => 'integer',
        'last_communication' => 'datetime',
        'environmental_data' => 'array',
    ];

    /**
     * Get the farm that owns the monitoring station.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Check if station is offline.
     */
    public function isOffline(): bool
    {
        if (!$this->last_communication) {
            return true;
        }

        return $this->last_communication->diffInMinutes(now()) > 15;
    }

    /**
     * Check if power is low.
     */
    public function isPowerLow(): bool
    {
        return $this->power_level !== null && $this->power_level < 20;
    }

    /**
     * Update last communication timestamp.
     */
    public function updateCommunication(array $environmentalData = null): void
    {
        $updateData = ['last_communication' => now()];
        
        if ($environmentalData) {
            $updateData['environmental_data'] = $environmentalData;
        }

        $this->update($updateData);
    }

    /**
     * Get deployed AI model version.
     */
    public function getAiModelVersion(string $modelType): ?string
    {
        return $this->ai_models[$modelType] ?? null;
    }
}
