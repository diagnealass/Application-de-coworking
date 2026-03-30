<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'space_id',
        'start_at',
        'end_at',
        'status',
        'notes',
        'total_price',
         'payment_status',
        'payment_reference',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at'   => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    // Calcul automatique du prix total
    protected static function booted()
    {
        static::creating(function ($reservation) {
            $space = Space::find($reservation->space_id);
            if ($space) {
                $hours = $reservation->start_at
                    ->diffInHours($reservation->end_at);
                $reservation->total_price = $space->price_per_hour * $hours;
            }
        });
    }
}
