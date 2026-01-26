<?php

namespace App\Models;

use App\Models\Marketplace\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class RefundRequest extends Model
{
    protected $fillable = [
        'order_id',
        'requested_by_user_id',
        'amount',
        'currency',
        'reason',
        'details',
        'status',
        'processed_by_admin_id',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_admin_id');
    }
}
