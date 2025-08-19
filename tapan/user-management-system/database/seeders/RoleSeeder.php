<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::create([
            'name' => 'admin',
            'description' => 'Full system access'
        ]);

        Role::create([
            'name' => 'editor',
            'description' => 'Content editing privileges'
        ]);

        Role::create([
            'name' => 'user',
            'description' => 'Basic user access'
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole->id
        ]);
    }
}
