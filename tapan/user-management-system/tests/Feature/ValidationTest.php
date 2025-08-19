<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        $role = \App\Models\Role::firstOrCreate([
            'name' => 'user',
            'description' => 'Regular User'
        ]);

        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id
        ]);
    }

    public function test_registration_validation()
    {
        // Test empty request
        $response = $this->postJson('/api/auth/register', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);

        // Test invalid email
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'short'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        // Test duplicate email
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'validPassword123'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_validation()
    {
        // Test empty request
        $response = $this->postJson('/api/auth/login', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);

        // Test invalid credentials
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword'
        ]);
        $response->assertStatus(401);
    }

    public function test_profile_update_validation()
    {
        $token = JWTAuth::fromUser($this->user);

        // Test invalid name
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->putJson('/api/users/me', [
            'name' => '',
            'email' => 'new@example.com'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);

        // Test invalid email
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->putJson('/api/users/me', [
            'name' => 'Valid Name',
            'email' => 'invalid-email'
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
