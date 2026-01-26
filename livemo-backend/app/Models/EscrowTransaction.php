<?php

namespace App\Models;

use App\Models\Marketplace\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class EscrowTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'seller_id',
        'amount',
        'currency',
        'type',
        'status',
        'notes',
        'processed_by_admin_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_admin_id');
    }
}
