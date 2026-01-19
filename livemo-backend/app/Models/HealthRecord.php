<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_id',
        'record_type',
        'temperature',
        'heart_rate',
        'respiratory_rate',
        'activity_level',
        'diagnosis',
        'symptoms',
        'treatment',
        'notes',
        'veterinarian',
        'next_checkup',
        'severity',
        'vital_signs',
    ];

    protected $casts = [
        'temperature' => 'decimal:1',
        'heart_rate' => 'integer',
        'respiratory_rate' => 'integer',
        'activity_level' => 'integer',
        'next_checkup' => 'date',
        'vital_signs' => 'array',
    ];

    /**
     * Get the animal that owns the health record.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Check if temperature is abnormal for cattle.
     */
    public function isTemperatureAbnormal(): bool
    {
        if (!$this->temperature) {
            return false;
        }

        // Normal cattle temperature: 38.0-39.3°C
        return $this->temperature < 38.0 || $this->temperature > 39.5;
    }

    /**
     * Check if vital signs indicate critical condition.
     */
    public function isCritical(): bool
    {
        return $this->severity === 'critical' || 
               ($this->temperature && $this->temperature > 40.0);
    }

    /**
     * Get health status color for UI.
     */
    public function getStatusColor(): string
    {
        return match($this->severity) {
            'normal' => 'green',
            'mild' => 'yellow',
            'moderate' => 'orange',
            'severe' => 'red',
            'critical' => 'darkred',
            default => 'gray',
        };
    }
}
