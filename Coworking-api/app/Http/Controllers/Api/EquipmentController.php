<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Http\Resources\EquipmentResource;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index()
    {
        $equipments = Equipment::latest()->get();
        return EquipmentResource::collection($equipments);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity'    => 'required|integer|min:1',
            'status'      => 'in:available,unavailable,maintenance',
        ]);

        $equipment = Equipment::create($data);

        return response()->json([
            'message'   => 'Équipement créé avec succès',
            'equipment' => new EquipmentResource($equipment),
        ], 201);
    }

    public function show(Equipment $equipment)
    {
        return new EquipmentResource($equipment->load('spaces'));
    }

    public function update(Request $request, Equipment $equipment)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'quantity'    => 'sometimes|integer|min:1',
            'status'      => 'in:available,unavailable,maintenance',
        ]);

        $equipment->update($data);

        return response()->json([
            'message'   => 'Équipement mis à jour',
            'equipment' => new EquipmentResource($equipment),
        ]);
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();
        return response()->json(['message' => 'Équipement supprimé']);
    }
}
