<?php

namespace App\Models;

use App\Models\Marketplace\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ListingReport extends Model
{
    protected $fillable = [
        'listing_id',
        'reporter_id',
        'reason',
        'details',
        'status',
        'assigned_admin_id',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }
}
