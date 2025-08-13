<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:api')->group(function () {
    // User profile routes
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::put('/users/{id}/assign-role', [RoleController::class, 'assignRole']);
    });
});
