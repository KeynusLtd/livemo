<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vaccination extends Model
{
    use HasFactory;

    protected $fillable = [
        'animal_id',
        'vaccine_name',
        'vaccine_type',
        'batch_number',
        'administered_date',
        'next_due_date',
        'administered_by',
        'dosage',
        'dosage_unit',
        'administration_route',
        'side_effects',
        'notes',
        'is_booster',
        'previous_vaccination_id',
    ];

    protected $casts = [
        'administered_date' => 'date',
        'next_due_date' => 'date',
        'dosage' => 'decimal:2',
        'is_booster' => 'boolean',
    ];

    /**
     * Get the animal that received the vaccination.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Get the previous vaccination if this is a booster.
     */
    public function previousVaccination(): BelongsTo
    {
        return $this->belongsTo(Vaccination::class, 'previous_vaccination_id');
    }

    /**
     * Check if vaccination is due soon (within 30 days).
     */
    public function isDueSoon(): bool
    {
        if (!$this->next_due_date) {
            return false;
        }

        return $this->next_due_date->diffInDays(now()) <= 30 && 
               $this->next_due_date->isFuture();
    }

    /**
     * Check if vaccination is overdue.
     */
    public function isOverdue(): bool
    {
        if (!$this->next_due_date) {
            return false;
        }

        return $this->next_due_date->isPast();
    }
}
