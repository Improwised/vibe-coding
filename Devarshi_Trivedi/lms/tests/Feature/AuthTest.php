<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'user', 'description' => 'Standard user']);
    }

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $payload = [
            'name'                  => 'John Doe',
            'email'                 => 'john@example.com',
            'password'              => 'Secret123!',
            'password_confirmation' => 'Secret123!',
        ];

        $response = $this->postJson('/api/users/register', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('user.email_id', 'john@example.com')
                 ->assertJsonPath('user.role.name', 'user');
    }

    /** @test */
    public function registration_fails_with_weak_password()
    {
        $payload = [
            'name'                  => 'John Doe',
            'email'                 => 'john@example.com',
            'password'              => 'weak',
            'password_confirmation' => 'weak',
        ];

        $response = $this->postJson('/api/users/register', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('password');
    }

    /** @test */
    public function user_can_login_with_correct_credentials()
    {
        $role = Role::where('name', 'user')->first();
        $user = User::create([
            'name'     => 'John Doe',
            'email_id'    => 'john+1@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => $role->id,
        ]);

        $response = $this->postJson('/api/users/login', [
            'email'    => 'john+1@example.com',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('user.email_id', 'john+1@example.com');
    }

    /** @test */
    public function login_fails_with_wrong_credentials()
    {
        $response = $this->postJson('/api/users/login', [
            'email'    => 'john@example.com',
            'password' => 'wrongpass',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid credentials']);
    }

    /** @test */
    public function login_is_rate_limited_after_five_attempts()
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/users/login', [
                'email'    => 'john@example.com',
                'password' => 'wrongpass',
            ]);
        }

        $response = $this->postJson('/api/users/login', [
            'email'    => 'john@example.com',
            'password' => 'wrongpass',
        ]);

        $response->assertStatus(429);
    }
}
