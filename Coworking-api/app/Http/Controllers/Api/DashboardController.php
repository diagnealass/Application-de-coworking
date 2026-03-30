<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Space;
use App\Models\Equipment;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'stats' => [
                'total_spaces'       => Space::count(),
                'total_equipments'   => Equipment::count(),
                'total_users'        => User::role('member')->count(),
                'total_reservations' => Reservation::count(),
                'pending'            => Reservation::where('status', 'pending')->count(),
                'confirmed'          => Reservation::where('status', 'confirmed')->count(),
                'cancelled'          => Reservation::where('status', 'cancelled')->count(),
                'revenue'            => Reservation::where('status', 'confirmed')
                                            ->sum('total_price'),
            ],
            'recent_reservations' => \App\Http\Resources\ReservationResource::collection(
                Reservation::with(['user', 'space'])
                    ->latest()
                    ->take(5)
                    ->get()
            ),
        ]);
    }
}
