<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'animal_id',
        'group_name',
        'feed_type',
        'quantity',
        'scheduled_time',
        'days_of_week',
        'is_recurring',
        'is_completed',
        'completed_at',
        'completed_by',
        'nutritional_info',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'scheduled_time' => 'datetime:H:i',
        'days_of_week' => 'array',
        'is_recurring' => 'boolean',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'nutritional_info' => 'array',
    ];

    /**
     * Get the farm that owns the feed schedule.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the animal for the feed schedule.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Get the user who completed the feeding.
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Mark the feeding as completed.
     */
    public function markCompleted(int $userId): void
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
            'completed_by' => $userId,
        ]);
    }

    /**
     * Check if feeding is due today.
     */
    public function isDueToday(): bool
    {
        if (!$this->is_recurring) {
            return false;
        }

        $today = now()->dayOfWeek; // 0 = Sunday, 6 = Saturday
        return in_array($today, $this->days_of_week ?? []);
    }
}
