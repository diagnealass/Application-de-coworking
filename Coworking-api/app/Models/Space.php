<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'capacity',
        'price_per_hour',
        'location',
        'status',
        'image',
    ];

    public function equipments()
    {
        return $this->belongsToMany(Equipment::class, 'equipment_space')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    // Vérifier si l'espace est disponible sur un créneau donné
    public function isAvailable(string $startAt, string $endAt): bool
    {
        return !$this->reservations()
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startAt, $endAt) {
                $query->whereBetween('start_at', [$startAt, $endAt])
                      ->orWhereBetween('end_at', [$startAt, $endAt])
                      ->orWhere(function ($q) use ($startAt, $endAt) {
                          $q->where('start_at', '<=', $startAt)
                            ->where('end_at', '>=', $endAt);
                      });
            })->exists();
    }

    public function images()
    {
        return $this->hasMany(SpaceImage::class)->orderBy('is_cover', 'desc');
    }

    public function coverImage()
    {
        return $this->hasOne(SpaceImage::class)->where('is_cover', true);
    }
}
