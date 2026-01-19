<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'animal_id',
        'sensor_id',
        'type',
        'severity',
        'title',
        'message',
        'metadata',
        'status',
        'acknowledged_by',
        'acknowledged_at',
        'resolved_by',
        'resolved_at',
        'resolution_notes',
    ];

    protected $casts = [
        'metadata' => 'array',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the farm that owns the alert.
     */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Get the animal related to the alert.
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    /**
     * Get the sensor related to the alert.
     */
    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }

    /**
     * Get the user who acknowledged the alert.
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    /**
     * Get the user who resolved the alert.
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Acknowledge the alert.
     */
    public function acknowledge(int $userId): void
    {
        $this->update([
            'status' => 'acknowledged',
            'acknowledged_by' => $userId,
            'acknowledged_at' => now(),
        ]);
    }

    /**
     * Resolve the alert.
     */
    public function resolve(int $userId, ?string $notes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_by' => $userId,
            'resolved_at' => now(),
            'resolution_notes' => $notes,
        ]);
    }

    /**
     * Check if alert is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if alert is critical.
     */
    public function isCritical(): bool
    {
        return $this->severity === 'critical';
    }

    /**
     * Get priority score for sorting (higher = more urgent).
     */
    public function getPriorityScore(): int
    {
        $severityScore = match($this->severity) {
            'critical' => 100,
            'warning' => 50,
            'info' => 10,
            default => 0,
        };

        $statusScore = match($this->status) {
            'pending' => 50,
            'acknowledged' => 25,
            default => 0,
        };

        return $severityScore + $statusScore;
    }
}
