<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, Role $role): bool
    {
        return true;
    }

    public function create(User $auth): bool
    {
        return $auth->role->name === 'admin';
    }

    public function update(User $auth, Role $role): bool
    {
        return $auth->role->name === 'admin';
    }

    public function delete(User $auth, Role $role): bool
    {
        return $auth->role->name === 'admin';
    }
}
