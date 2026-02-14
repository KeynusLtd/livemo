<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnimalCatalog extends Model
{
    use HasFactory;

    protected $table = 'animal_catalogs';

    protected $fillable = [
        'name',
        'type',
        'breed',
        'default_gender',
        'is_active',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];
}
