<?php
// database/seeders/SuperAdminSeeder.php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create the super_admin role if it doesn't exist
        $role = Role::firstOrCreate(['role_name' => 'super_admin']);

        // Create the first super admin user
        $user = User::firstOrCreate(
            ['name' => 'Super Admin', 'email' => 'superadmin@app.com'],
            [
                'password'  => Hash::make('SuperSecret123!'),
                'is_active' => 'Y',
            ]
        );

        // Attach role
        $user->roles()->syncWithoutDetaching([$role->id_role]);

        $this->command->info('Super admin seeded: superadmin@app.com');
    }
}