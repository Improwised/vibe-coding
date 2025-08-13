<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserRoleController;

Route::post('users/register', [AuthController::class, 'register']);
Route::post('users/login', [AuthController::class, 'login'])
     ->middleware('throttle:5,1');

Route::middleware('auth:api')->group(function () {
     Route::get('users/{user}', [UserController::class, 'show'])
          ->middleware('can:view,user');
     Route::put('users/{user}', [UserController::class, 'update'])
          ->middleware('can:update,user');
     Route::delete('users/{user}', [UserController::class, 'destroy'])
          ->middleware('role:admin');

     Route::get('roles', [RoleController::class, 'index'])
          ->middleware('role:admin');
     Route::post('roles', [RoleController::class, 'store'])
          ->middleware('role:admin');
     Route::put('roles/{role}', [RoleController::class, 'update'])
          ->middleware('role:admin');
     Route::delete('roles/{role}', [RoleController::class, 'destroy'])
          ->middleware('role:admin');

     Route::put('users/{user}/assign-role', [UserController::class, 'assignRole'])
          ->middleware('role:admin');
});
