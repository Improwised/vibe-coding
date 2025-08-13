<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::all());
    }

    public function assignRole(Request $request, $userId)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::findOrFail($userId);
        $user->update(['role_id' => $validated['role_id']]);

        return response()->json($user->load('role'));
    }
}
