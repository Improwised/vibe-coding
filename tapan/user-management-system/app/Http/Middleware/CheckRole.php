<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Role;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $roleName): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $requiredRole = Role::where('name', $roleName)->first();

        if (!$requiredRole) {
            return response()->json(['error' => 'Invalid role specified'], 400);
        }

        if ($user->role_id !== $requiredRole->id) {
            return response()->json([
                'error' => 'Insufficient permissions',
                'required_role' => $roleName,
                'current_role' => $user->role->name ?? 'none'
            ], 403);
        }

        return $next($request);
    }
}
