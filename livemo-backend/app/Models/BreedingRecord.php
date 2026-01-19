<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreedingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'mother_id',
        'father_id',
        'method',
        'breeding_date',
        'expected_birth_date',
        'actual_birth_date',
        'status',
        'pregnancy_days',
        'is_successful',
        'offspring_count',
        'offspring_ids',
        'complications',
        'notes',
    ];

    protected $casts = [
        'breeding_date' => 'date',
        'expected_birth_date' => 'date',
        'actual_birth_date' => 'date',
        'pregnancy_days' => 'integer',
        'is_successful' => 'boolean',
        'offspring_count' => 'integer',
        'offspring_ids' => 'array',
    ];

    /**
     * Get the farm that owns the breeding record.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the mother animal.
     */
    public function mother(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'mother_id');
    }

    /**
     * Get the father animal.
     */
    public function father(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'father_id');
    }

    /**
     * Calculate expected birth date based on breeding date.
     */
    public function calculateExpectedBirthDate(): void
    {
        if (!$this->breeding_date || !$this->mother) {
            return;
        }

        // Gestation periods by animal type (in days)
        $gestationPeriods = [
            'cattle' => 283,
            'goats' => 150,
            'sheep' => 147,
            'swine' => 114,
            'horses' => 340,
        ];

        $gestationDays = $gestationPeriods[$this->mother->type] ?? 283;
        
        $this->expected_birth_date = $this->breeding_date->copy()->addDays($gestationDays);
        $this->save();
    }

    /**
     * Update pregnancy days.
     */
    public function updatePregnancyDays(): void
    {
        if ($this->breeding_date && $this->status === 'confirmed_pregnant') {
            $this->pregnancy_days = $this->breeding_date->diffInDays(now());
            $this->save();
        }
    }

    /**
     * Check if birth is overdue.
     */
    public function isOverdue(): bool
    {
        if (!$this->expected_birth_date || $this->actual_birth_date) {
            return false;
        }

        return now()->greaterThan($this->expected_birth_date->addDays(7));
    }
}
