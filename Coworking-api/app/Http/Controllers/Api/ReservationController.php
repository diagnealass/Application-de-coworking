<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Space;
use App\Http\Resources\ReservationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Admin voit tout, member voit ses réservations
        $reservations = $user->hasRole('admin')
            ? Reservation::with(['user', 'space'])->latest()->get()
            : Reservation::with(['user', 'space'])
                ->where('user_id', $user->id)
                ->latest()->get();

        return ReservationResource::collection($reservations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'space_id' => 'required|exists:spaces,id',
            'start_at' => 'required|date|after:now',
            'end_at'   => 'required|date|after:start_at',
            'notes'    => 'nullable|string',
        ]);

        // Vérifier la disponibilité
        $space = Space::findOrFail($data['space_id']);
        if (!$space->isAvailable($data['start_at'], $data['end_at'])) {
            return response()->json([
                'message' => 'Cet espace n\'est pas disponible sur ce créneau.',
            ], 422);
        }

        $reservation = Reservation::create([
            ...$data,
            'user_id' => Auth::id(),
            'status'  => 'pending',
        ]);

        return response()->json([
            'message'     => 'Réservation créée avec succès',
            'reservation' => new ReservationResource(
                $reservation->load(['user', 'space'])
            ),
        ], 201);
    }

    public function show(Reservation $reservation)
    {
        // Un membre ne peut voir que ses propres réservations
        if (!Auth::user()->hasRole('admin') &&
            $reservation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return new ReservationResource($reservation->load(['user', 'space']));
    }

    public function update(Request $request, Reservation $reservation)
    {
        // Seul l'admin peut changer le statut
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $reservation->update($data);

        return response()->json([
            'message'     => 'Réservation mise à jour',
            'reservation' => new ReservationResource(
                $reservation->load(['user', 'space'])
            ),
        ]);
    }
    public function pay(Reservation $reservation)
{
    // Vérifier que c'est bien la réservation de l'utilisateur connecté
    if ($reservation->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    if ($reservation->payment_status === 'paid') {
        return response()->json(['message' => 'Cette réservation est déjà payée'], 422);
    }

    // Simuler un paiement — générer une référence unique
    $reference = 'PAY-' . strtoupper(uniqid());

    $reservation->update([
        'payment_status'    => 'paid',
        'payment_reference' => $reference,
        'status'            => 'confirmed', // confirmer automatiquement après paiement
    ]);

    return response()->json([
        'message'   => 'Paiement effectué avec succès',
        'reference' => $reference,
        'reservation' => new \App\Http\Resources\ReservationResource(
            $reservation->load(['user', 'space'])
        ),
    ]);
}

    public function destroy(Reservation $reservation)
    {
        // Admin ou propriétaire peut annuler
        if (!Auth::user()->hasRole('admin') &&
            $reservation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Réservation annulée']);
    }
}
