<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles once
        Role::create(['name' => 'admin',  'description' => 'Full access']);
        Role::create(['name' => 'editor', 'description' => 'Can edit']);
        Role::create(['name' => 'user',   'description' => 'Standard user']);
    }

    private function actingAsAdmin(): string
    {
        $admin = User::create([
            'name'     => 'Admin',
            'email_id' => 'admin@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => Role::where('name', 'admin')->first()->id,
        ]);

        return \Tymon\JWTAuth\Facades\JWTAuth::fromUser($admin);
    }

    private function actingAsRegular(): string
    {
        $user = User::create([
            'name'     => 'Regular',
            'email_id' => 'user@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => Role::where('name', 'user')->first()->id,
        ]);

        return \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);
    }

    /** @test */
    public function authenticated_user_can_list_roles()
    {
        $token = $this->actingAsRegular();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson('/api/roles');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function admin_can_create_role()
    {
        $token = $this->actingAsAdmin();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/roles', [
                             'name'        => 'manager',
                             'description' => 'Can manage content',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('name', 'manager');
    }

    /** @test */
    public function non_admin_cannot_create_role()
    {
        $token = $this->actingAsRegular();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->postJson('/api/roles', [
                             'name'        => 'manager',
                             'description' => 'Can manage content',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_update_role()
    {
        $token = $this->actingAsAdmin();
        $role  = Role::where('name', 'editor')->first();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/roles/{$role->id}", [
                             'description' => 'Updated description',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('description', 'Updated description');
    }

    /** @test */
    public function non_admin_cannot_update_role()
    {
        $token = $this->actingAsRegular();
        $role  = Role::where('name', 'editor')->first();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/roles/{$role->id}", [
                             'description' => 'Updated description',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_role()
    {
        $token = $this->actingAsAdmin();
        $role  = Role::where('name', 'editor')->first();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(204);
    }

    /** @test */
    public function non_admin_cannot_delete_role()
    {
        $token = $this->actingAsRegular();
        $role  = Role::where('name', 'editor')->first();

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->deleteJson("/api/roles/{$role->id}");

        $response->assertStatus(403);
    }
}
