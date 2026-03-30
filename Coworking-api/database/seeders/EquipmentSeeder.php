<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Equipment;
use App\Models\Space;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipments = [
            [
                'name'        => 'Projecteur',
                'description' => 'Projecteur HD pour présentations.',
                'quantity'    => 3,
                'status'      => 'available',
            ],
            [
                'name'        => 'Tableau blanc',
                'description' => 'Tableau blanc magnétique avec marqueurs.',
                'quantity'    => 5,
                'status'      => 'available',
            ],
            [
                'name'        => 'Visioconférence',
                'description' => 'Système de visioconférence Zoom/Teams.',
                'quantity'    => 2,
                'status'      => 'available',
            ],
            [
                'name'        => 'Imprimante',
                'description' => 'Imprimante laser couleur.',
                'quantity'    => 2,
                'status'      => 'available',
            ],
            [
                'name'        => 'Climatiseur',
                'description' => 'Climatisation individuelle.',
                'quantity'    => 4,
                'status'      => 'available',
            ],
        ];

        foreach ($equipments as $eq) {
            Equipment::create($eq);
        }

        // Associer les équipements aux espaces
        $salle      = Space::find(1); // Salle Innovation
        $bureau     = Space::find(2); // Bureau Privé
        $conference = Space::find(3); // Salle Conférence

        $salle->equipments()->attach([
            1 => ['quantity' => 1], // Projecteur
            2 => ['quantity' => 2], // Tableau blanc
            5 => ['quantity' => 1], // Climatiseur
        ]);

        $bureau->equipments()->attach([
            4 => ['quantity' => 1], // Imprimante
            5 => ['quantity' => 1], // Climatiseur
        ]);

        $conference->equipments()->attach([
            1 => ['quantity' => 2], // Projecteur
            2 => ['quantity' => 1], // Tableau blanc
            3 => ['quantity' => 1], // Visioconférence
            5 => ['quantity' => 1], // Climatiseur
        ]);
    }
}
