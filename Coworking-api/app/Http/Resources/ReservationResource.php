<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'user'        => new UserResource($this->whenLoaded('user')),
            'space'       => new SpaceResource($this->whenLoaded('space')),
            'start_at'    => $this->start_at->format('Y-m-d H:i'),
            'end_at'      => $this->end_at->format('Y-m-d H:i'),
            'status'      => $this->status,
            'notes'       => $this->notes,
            'total_price' => $this->total_price,
            'payment_status'    => $this->payment_status,
            'payment_reference' => $this->payment_reference,
            'created_at'  => $this->created_at->format('d/m/Y'),
        ];
    }
}
