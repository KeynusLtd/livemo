<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Animal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'tag_id',
        'name',
        'type',
        'breed',
        'gender',
        'birth_date',
        'weight',
        'color',
        'markings',
        'status',
        'health_score',
        'mother_id',
        'father_id',
        'metadata',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'weight' => 'decimal:2',
        'health_score' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the farm that owns the animal.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the mother of the animal.
     */
    public function mother(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'mother_id');
    }

    /**
     * Get the father of the animal.
     */
    public function father(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'father_id');
    }

    /**
     * Get all offspring of the animal.
     */
    public function offspring(): HasMany
    {
        return $this->hasMany(Animal::class, 'mother_id')
            ->orWhere('father_id', $this->id);
    }

    /**
     * Get all health records for the animal.
     */
    public function healthRecords(): HasMany
    {
        return $this->hasMany(HealthRecord::class);
    }

    /**
     * Get all sensors assigned to the animal.
     */
    public function sensors(): HasMany
    {
        return $this->hasMany(Sensor::class);
    }

    /**
     * Get all alerts for the animal.
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Get all vaccinations for the animal.
     */
    public function vaccinations(): HasMany
    {
        return $this->hasMany(Vaccination::class);
    }

    /**
     * Get all breeding records where this animal is the mother.
     */
    public function breedingRecordsAsMother(): HasMany
    {
        return $this->hasMany(BreedingRecord::class, 'mother_id');
    }

    /**
     * Get all breeding records where this animal is the father.
     */
    public function breedingRecordsAsFather(): HasMany
    {
        return $this->hasMany(BreedingRecord::class, 'father_id');
    }

    /**
     * Get current pasture assignment.
     */
    public function currentPasture()
    {
        return $this->belongsToMany(Pasture::class, 'pasture_assignments')
            ->wherePivot('is_current', true)
            ->withPivot('assigned_at', 'notes')
            ->withTimestamps();
    }

    /**
     * Get all pasture assignments history.
     */
    public function pastureHistory()
    {
        return $this->belongsToMany(Pasture::class, 'pasture_assignments')
            ->withPivot('assigned_at', 'removed_at', 'is_current', 'notes')
            ->withTimestamps();
    }

    /**
     * Calculate age in months.
     */
    public function getAgeInMonths(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }

        return $this->birth_date->diffInMonths(now());
    }

    /**
     * Get latest health record.
     */
    public function getLatestHealthRecord(): ?HealthRecord
    {
        return $this->healthRecords()->latest()->first();
    }

    /**
     * Check if animal needs attention.
     */
    public function needsAttention(): bool
    {
        return $this->health_score < 70 || 
               $this->status === 'sick' || 
               $this->alerts()->where('status', 'pending')->exists();
    }
}
