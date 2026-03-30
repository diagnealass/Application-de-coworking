<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Http\Resources\SpaceResource;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    public function index()
    {
        $spaces = Space::with(['equipments', 'reservations.user'])
                       ->latest()
                       ->get();
        return SpaceResource::collection($spaces);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'capacity'       => 'required|integer|min:1',
            'price_per_hour' => 'required|numeric|min:0',
            'location'       => 'nullable|string',
            'status'         => 'in:available,unavailable,maintenance',
            'equipments'     => 'nullable|array',
            'equipments.*.id'       => 'exists:equipments,id',
            'equipments.*.quantity' => 'integer|min:1',
        ]);

        $space = Space::create($data);

        // Attacher les équipements avec leurs quantités
        if (!empty($data['equipments'])) {
            $sync = [];
            foreach ($data['equipments'] as $eq) {
                $sync[$eq['id']] = ['quantity' => $eq['quantity'] ?? 1];
            }
            $space->equipments()->sync($sync);
        }

        return response()->json([
            'message' => 'Espace créé avec succès',
            'space'   => new SpaceResource(
                $space->load(['equipments', 'reservations'])
            ),
        ], 201);
    }

    public function show(Space $space)
    {
        return new SpaceResource(
            $space->load(['equipments', 'reservations.user'])
        );
    }

    public function update(Request $request, Space $space)
    {
        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
            'capacity'       => 'sometimes|integer|min:1',
            'price_per_hour' => 'sometimes|numeric|min:0',
            'location'       => 'nullable|string',
            'status'         => 'in:available,unavailable,maintenance',
            'equipments'     => 'nullable|array',
            'equipments.*.id'       => 'exists:equipments,id',
            'equipments.*.quantity' => 'integer|min:1',
        ]);

        $space->update($data);

        if (isset($data['equipments'])) {
            $sync = [];
            foreach ($data['equipments'] as $eq) {
                $sync[$eq['id']] = ['quantity' => $eq['quantity'] ?? 1];
            }
            $space->equipments()->sync($sync);
        }

        return response()->json([
            'message' => 'Espace mis à jour',
            'space'   => new SpaceResource(
                $space->load(['equipments', 'reservations'])
            ),
        ]);
    }

    public function destroy(Space $space)
    {
        $space->delete();
        return response()->json(['message' => 'Espace supprimé']);
    }

    public function checkAvailability(Request $request, Space $space)
    {
        $request->validate([
            'start_at' => 'required|date',
            'end_at'   => 'required|date|after:start_at',
        ]);

        $available = $space->isAvailable(
            $request->start_at,
            $request->end_at
        );

        return response()->json([
            'available' => $available,
            'space'     => new SpaceResource($space),
        ]);
    }
}
