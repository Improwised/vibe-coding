<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $auth): bool
    {
        return true;
    }

    public function view(User $auth, User $user): bool
    {
        return $auth->id === $user->id || $auth->role->name === 'admin';
    }

    public function create(User $auth): bool
    {
        return true;
    }

    public function update(User $auth, User $user): bool
    {
        return $auth->id === $user->id || $auth->role->name === 'admin';
    }

    public function delete(User $auth, User $user): bool
    {
        return $auth->role->name === 'admin';
    }

    public function assignRole(User $auth): bool
    {
        return $auth->role->name === 'admin';
    }
}
