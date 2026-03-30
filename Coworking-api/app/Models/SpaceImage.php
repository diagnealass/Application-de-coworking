<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpaceImage extends Model
{
    protected $fillable = [
        'space_id',
        'path',
        'caption',
        'is_cover',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    // URL complète de l'image
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
