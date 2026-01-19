<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'subject',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the listing.
     */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * Get all messages.
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    /**
     * Get all participants.
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }

    /**
     * Add a participant.
     */
    public function addParticipant(User $user): void
    {
        if (!$this->participants->contains($user->id)) {
            $this->participants()->attach($user->id);
        }
    }

    /**
     * Mark as read for a user.
     */
    public function markAsReadFor(User $user): void
    {
        $this->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);
    }

    /**
     * Get unread count for a user.
     */
    public function getUnreadCountFor(User $user): int
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        
        if (!$participant) {
            return 0;
        }

        $lastReadAt = $participant->pivot->last_read_at;

        return $this->messages()
                    ->where('sender_id', '!=', $user->id)
                    ->where(function ($query) use ($lastReadAt) {
                        if ($lastReadAt) {
                            $query->where('created_at', '>', $lastReadAt);
                        }
                    })
                    ->count();
    }

    /**
     * Scope to get conversations for a user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }
}
