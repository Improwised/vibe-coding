<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignRoleRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function show(User $user)
    {
        Gate::authorize('view', $user);
        return response()->json($user->load('role'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        Gate::authorize('update', $user);

        $user->update($request->only('name', 'email_id'));

        return response()->json($user->fresh('role'));
    }

    public function destroy(User $user)
    {
        Gate::authorize('delete', $user);

        $user->delete();
        return response()->json(null, 204);
    }

    public function assignRole(AssignRoleRequest $request, User $user)
    {
        Gate::authorize('assignRole', $user);

        $role = Role::where('name', $request->role)->firstOrFail();
        $user->update(['role_id' => $role->id]);

        return response()->json($user->load('role'));
    }
}
