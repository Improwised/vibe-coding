<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
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
    }
}
