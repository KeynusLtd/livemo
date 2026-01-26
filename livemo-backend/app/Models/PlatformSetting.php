<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'updated_by',
    ];

    protected $casts = [
        'value' => 'array',
        'updated_by' => 'integer',
    ];
}
