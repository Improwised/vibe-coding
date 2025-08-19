<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        if (!User::where('email', 'admin@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role_id' => 1, // Admin role
                'password' => bcrypt('admin123'),
            ]);
        }

        if (!User::where('email', 'user@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'user@example.com',
                'role_id' => 3, // User role
                'password' => bcrypt('password'),
            ]);
        }
    }
}
