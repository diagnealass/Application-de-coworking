<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Equipment extends Model
{
    use HasFactory;
    protected $table = 'equipments';

    protected $fillable = [
        'name',
        'description',
        'quantity',
        'status',
        'image',
    ];

    public function spaces()
    {
        return $this->belongsToMany(Space::class, 'equipment_space')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
}
