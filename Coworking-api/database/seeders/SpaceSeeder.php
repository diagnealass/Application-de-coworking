<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Space;

class SpaceSeeder extends Seeder
{
    public function run(): void
    {
        $spaces = [
            [
                'name'           => 'Salle Innovation',
                'description'    => 'Grande salle lumineuse idéale pour les équipes créatives.',
                'capacity'       => 10,
                'price_per_hour' => 5000,
                'location'       => 'Bâtiment A - RDC',
                'status'         => 'available',
            ],
            [
                'name'           => 'Bureau Privé 1',
                'description'    => 'Bureau fermé pour travailler au calme.',
                'capacity'       => 2,
                'price_per_hour' => 2500,
                'location'       => 'Bâtiment A - 1er étage',
                'status'         => 'available',
            ],
            [
                'name'           => 'Salle de Conférence',
                'description'    => 'Salle équipée pour vos réunions et présentations.',
                'capacity'       => 20,
                'price_per_hour' => 8000,
                'location'       => 'Bâtiment B - RDC',
                'status'         => 'available',
            ],
            [
                'name'           => 'Espace Open Space',
                'description'    => 'Espace collaboratif ouvert pour freelances.',
                'capacity'       => 15,
                'price_per_hour' => 1500,
                'location'       => 'Bâtiment B - 2ème étage',
                'status'         => 'available',
            ],
        ];

        foreach ($spaces as $space) {
            Space::create($space);
        }
    }
}
