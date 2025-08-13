<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::with('role')->findOrFail($id);

        // Only allow users to view their own profile unless admin
        if (Auth::id() != $user->id && !Auth::user()->role->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Only allow users to update their own profile unless admin
        if (Auth::id() != $user->id && !Auth::user()->role->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        // Only allow admins to delete users
        if (!Auth::user()->role->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }
}
