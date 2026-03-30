<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Créer les rôles
        $admin  = Role::create(['name' => 'admin']);
        $member = Role::create(['name' => 'member']);

        // Créer les permissions
        $permissions = [
            'manage-spaces',
            'manage-equipments',
            'manage-users',
            'manage-reservations',
            'view-dashboard',
            'create-reservation',
            'cancel-own-reservation',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assigner les permissions aux rôles
        $admin->givePermissionTo($permissions);

        $member->givePermissionTo([
            'create-reservation',
            'cancel-own-reservation',
        ]);
    }
}
