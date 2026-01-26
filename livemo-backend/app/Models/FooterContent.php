<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class FooterContent extends Model
{
    protected $fillable = [
        'key',
        'title',
        'content',
        'order',
        'is_active',
        'updated_by',
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
