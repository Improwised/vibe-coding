<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

class EndpointTests extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $user;
    protected $adminToken;
    protected $userToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Administrator']);
        $userRole = Role::create(['name' => 'user', 'description' => 'Regular User']);

        // Create admin user
        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id
        ]);
        $this->adminToken = JWTAuth::fromUser($this->admin);

        // Create regular user
        $this->user = User::factory()->create([
            'role_id' => $userRole->id
        ]);
        $this->userToken = JWTAuth::fromUser($this->user);
    }

    public function test_user_registration()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ]
            ]);
    }

    public function test_user_login()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'password'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in'
            ]);
    }

    public function test_get_user_profile()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->userToken
        ])->getJson('/api/users/me');

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email']);
    }

    public function test_role_management_by_admin()
    {
        // Create role
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->postJson('/api/roles', [
            'name' => 'editor',
            'description' => 'Content Editor'
        ]);

        $response->assertStatus(201);

        // Get roles
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->adminToken
        ])->getJson('/api/roles');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // admin, user, editor
    }

    public function test_role_management_by_non_admin()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->userToken
        ])->getJson('/api/roles');

        $response->assertStatus(403);
    }
}
