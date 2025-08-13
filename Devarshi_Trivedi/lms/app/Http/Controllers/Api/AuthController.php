<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterUserRequest $request)
    {
        $roleId = Role::where('name', RoleEnum::USER->value)->first()->id;
        $user = User::create([
            'name'     => $request->name,
            'email_id' => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => $roleId, // Default role for new users
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user'  => $user->load('role'),
            'token' => $token,
        ], 201);
    }

    public function login(LoginUserRequest $request)
    {
        $credentials = [
            'email_id' => $request->email,
            'password' => $request->password,
        ];

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'user'  => auth()->user()->load('role'),
            'token' => $token,
        ]);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Logged out']);
    }
}
