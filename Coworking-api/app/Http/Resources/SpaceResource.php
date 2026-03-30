<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SpaceResource extends JsonResource
{
    public function toArray($request): array
    {
        $now = now();

        // Chercher une réservation active parmi celles déjà chargées
        $activeReservation = null;
        $nextReservation   = null;

        if ($this->relationLoaded('reservations')) {
            $activeReservation = $this->reservations
                ->where('status', '!=', 'cancelled')
                ->where('start_at', '<=', $now)
                ->where('end_at', '>=', $now)
                ->first();

            $nextReservation = $this->reservations
                ->where('status', '!=', 'cancelled')
                ->where('start_at', '>', $now)
                ->sortBy('start_at')
                ->first();
        }

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'description'    => $this->description,
            'capacity'       => $this->capacity,
            'price_per_hour' => $this->price_per_hour,
            'location'       => $this->location,
            'status'         => $this->status,
            'image'          => $this->image,
            'equipments'     => EquipmentResource::collection(
                                    $this->whenLoaded('equipments')
                                ),
            'is_currently_reserved' => !is_null($activeReservation),
            'active_reservation'    => $activeReservation ? [
                'end_at'    => $activeReservation->end_at->format('Y-m-d H:i'),
                'user_name' => $activeReservation->user?->name,
            ] : null,
            'next_reservation' => $nextReservation ? [
                'start_at' => $nextReservation->start_at->format('Y-m-d H:i'),
                'end_at'   => $nextReservation->end_at->format('Y-m-d H:i'),
            ] : null,
            'created_at' => $this->created_at->format('d/m/Y'),
        ];
    }
}
