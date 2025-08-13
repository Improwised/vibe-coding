<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'admin', 'description' => 'Full access']);
        $userRole  = Role::create(['name' => 'user',   'description' => 'Standard user']);

        $this->admin = User::create([
            'name'     => 'Admin',
            'email_id' => 'admin@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => $adminRole->id,
        ]);

        $this->regularUser = User::create([
            'name'     => 'Regular',
            'email_id' => 'user@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => $userRole->id,
        ]);
    }

    /** @test */
    public function authenticated_user_can_view_own_profile()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->regularUser);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson("/api/users/{$this->regularUser->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('id', $this->regularUser->id);
    }

    /** @test */
    public function admin_can_view_any_profile()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->admin);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson("/api/users/{$this->regularUser->id}");

        $response->assertStatus(200);
    }

    /** @test */
    public function user_cannot_view_other_profile()
    {
        $otherUser = User::create([
            'name'     => 'Other',
            'email_id' => 'other@example.com',
            'password' => Hash::make('Secret123!'),
            'role_id'  => Role::where('name', 'user')->first()->id,
        ]);
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->regularUser);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->getJson("/api/users/{$otherUser->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_update_own_profile()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->regularUser);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/users/{$this->regularUser->id}", [
                             'name' => 'Updated Name',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('name', 'Updated Name');
    }

    /** @test */
    public function user_cannot_change_own_role()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->regularUser);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/users/{$this->regularUser->id}/assign-role", [
                             'role' => 'admin',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_assign_role_to_user()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->admin);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->putJson("/api/users/{$this->regularUser->id}/assign-role", [
                             'role' => 'admin',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('role.name', 'admin');
    }

    /** @test */
    public function admin_can_delete_user()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->admin);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->deleteJson("/api/users/{$this->regularUser->id}");

        $response->assertStatus(204);
    }

    /** @test */
    public function regular_user_cannot_delete_user()
    {
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($this->regularUser);

        $response = $this->withHeader('Authorization', "Bearer $token")
                         ->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(403);
    }
}
