<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'quantity'    => $this->quantity,
            'status'      => $this->status,
            'image'       => $this->image,
            'pivot'       => $this->whenPivotLoaded('equipment_space', function () {
                return ['quantity' => $this->pivot->quantity];
            }),
        ];
    }
}
