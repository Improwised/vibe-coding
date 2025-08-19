<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

class RoleBasedAccessTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $user;
    protected $role;

    protected function setUp(): void
    {
        parent::setUp();

        // Create default roles if not exists
        Role::firstOrCreate(['name' => 'admin', 'description' => 'Administrator']);
        Role::firstOrCreate(['name' => 'user', 'description' => 'Regular User']);

        // Create test role
        $this->role = Role::create([
            'name' => 'test-role',
            'description' => 'Test Role'
        ]);

        // Create admin user
        $this->admin = User::factory()->create([
            'role_id' => Role::where('name', 'admin')->first()->id
        ]);

        // Create regular user
        $this->user = User::factory()->create([
            'role_id' => $this->role->id
        ]);
    }

    public function test_admin_can_access_protected_routes()
    {
        $token = JWTAuth::fromUser($this->admin);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->get('/api/roles');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_protected_routes()
    {
        $token = JWTAuth::fromUser($this->user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->get('/api/roles');

        $response->assertStatus(403);
    }
}
