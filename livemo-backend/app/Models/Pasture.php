<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pasture extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'name',
        'description',
        'size',
        'capacity',
        'current_occupancy',
        'quality',
        'latitude',
        'longitude',
        'boundaries',
        'last_rotation',
        'next_rotation',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'size' => 'decimal:2',
        'capacity' => 'integer',
        'current_occupancy' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'boundaries' => 'array',
        'last_rotation' => 'date',
        'next_rotation' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the farm that owns the pasture.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get all animals currently in this pasture.
     */
    public function currentAnimals(): BelongsToMany
    {
        return $this->belongsToMany(Animal::class, 'pasture_assignments')
            ->wherePivot('is_current', true)
            ->withPivot('assigned_at', 'notes')
            ->withTimestamps();
    }

    /**
     * Get all animals ever assigned to this pasture.
     */
    public function allAnimals(): BelongsToMany
    {
        return $this->belongsToMany(Animal::class, 'pasture_assignments')
            ->withPivot('assigned_at', 'removed_at', 'is_current', 'notes')
            ->withTimestamps();
    }

    /**
     * Check if pasture is at capacity.
     */
    public function isAtCapacity(): bool
    {
        return $this->current_occupancy >= $this->capacity;
    }

    /**
     * Get available space.
     */
    public function getAvailableSpace(): int
    {
        return max(0, $this->capacity - $this->current_occupancy);
    }

    /**
     * Assign animal to pasture.
     */
    public function assignAnimal(int $animalId, ?string $notes = null): void
    {
        if ($this->isAtCapacity()) {
            throw new \Exception('Pasture is at full capacity');
        }

        $this->allAnimals()->attach($animalId, [
            'assigned_at' => now(),
            'is_current' => true,
            'notes' => $notes,
        ]);

        $this->increment('current_occupancy');
    }

    /**
     * Remove animal from pasture.
     */
    public function removeAnimal(int $animalId): void
    {
        $this->allAnimals()->updateExistingPivot($animalId, [
            'removed_at' => now(),
            'is_current' => false,
        ]);

        $this->decrement('current_occupancy');
    }
}
