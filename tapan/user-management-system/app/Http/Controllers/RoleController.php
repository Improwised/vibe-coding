<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::select(['id', 'name', 'description', 'created_at', 'updated_at'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $roles,
            'meta' => [
                'count' => $roles->count()
            ]
        ]);
    }

    public function assignRole(Request $request, $userId)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::findOrFail($userId);
        $user->update(['role_id' => $validated['role_id']]);

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role_id' => $user->role_id
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'description' => 'nullable|string|max:500'
        ]);

        $role = Role::create($validated);

        return response()->json([
            'message' => 'Role created successfully',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description
            ]
        ], 201);
    }

    public function show(Role $role)
    {
        //
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:roles,name,'.$role->id,
            'description' => 'nullable|string|max:500'
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description
            ]
        ]);
    }

    public function destroy(Role $role)
    {
        // Prevent deletion of default roles
        if (in_array($role->name, ['admin', 'user'])) {
            return response()->json([
                'message' => 'System roles cannot be deleted'
            ], 403);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }
}
