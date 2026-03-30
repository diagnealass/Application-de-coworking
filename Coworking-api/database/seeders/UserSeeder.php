<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'name'     => 'Admin Coworking',
            'email'    => 'admin@coworking.com',
            'phone'    => '+221 77 000 00 00',
            'company'  => 'Coworking Space',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        // Membres de test
        $members = [
            [
                'name'    => 'Alassane Diagne',
                'email'   => 'alassane@test.com',
                'phone'   => '+221 77 111 11 11',
                'company' => 'Tech Sénégal',
            ],
            [
                'name'    => 'Fatou Sow',
                'email'   => 'fatou@test.com',
                'phone'   => '+221 77 222 22 22',
                'company' => 'StartupDakar',
            ],
            [
                'name'    => 'Moussa Fall',
                'email'   => 'moussa@test.com',
                'phone'   => '+221 77 333 33 33',
                'company' => 'FreelanceDev',
            ],
        ];

        foreach ($members as $member) {
            $user = User::create([
                ...$member,
                'password' => bcrypt('password'),
            ]);
            $user->assignRole('member');
        }
    }
}
