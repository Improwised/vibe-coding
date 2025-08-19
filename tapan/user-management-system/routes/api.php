<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Temporary route to verify admin user - remove after use
Route::get('/verify-admin', function() {
    $user = User::where('email', 'admin@example.com')->first();
    return response()->json([
        'exists' => $user !== null,
        'is_admin' => $user && $user->role_id === 1,
        'password_matches' => $user ? Hash::check('admin123', $user->password) : false
    ]);
});

Route::middleware('jwt.auth')->group(function () {
    // User profile routes
    Route::get('/users/me', [UserProfileController::class, 'getProfile']);
    Route::put('/users/me', [UserProfileController::class, 'updateProfile']);
    Route::put('/users/me/password', [UserProfileController::class, 'updatePassword']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Admin-only routes
    Route::middleware([\App\Http\Middleware\CheckRole::class . ':admin'])->group(function () {
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::get('/roles', [\App\Http\Controllers\RoleController::class, 'index']);
        Route::post('/roles', [\App\Http\Controllers\RoleController::class, 'store']);
        Route::put('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'update']);
        Route::delete('/roles/{role}', [\App\Http\Controllers\RoleController::class, 'destroy']);
        Route::put('/users/{id}/assign-role', [\App\Http\Controllers\RoleController::class, 'assignRole']);
    });
});
