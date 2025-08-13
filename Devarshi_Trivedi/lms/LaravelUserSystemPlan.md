# Laravel User Management System – Complete Implementation Plan
Version: 2.0 (no failed_logins table, bcrypt hashing, Pest-only pre-commit)

────────────────────────────────────────────────────────
1. Project Setup
────────────────────────────────────────────────────────
1.1  Install Laravel (≥ 10.x)  
     laravel new user-system --jet --api

1.2  Install required packages  
     composer require tymon/jwt-auth  
     composer require spatie/laravel-permission   # optional RBAC helpers  
     php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

1.3  Environment keys  
     JWT_SECRET=base64:...  
     JWT_TTL=60  
     JWT_REFRESH_TTL=20160

────────────────────────────────────────────────────────
2. Database Design
────────────────────────────────────────────────────────
2.1  Migration files (run `php artisan make:migration` for each)

users
  id (PK, bigint)
  email (unique, string)
  password_hash (string, 255)   ← bcrypt via Hash::make()
  name (string, 255, nullable)
  role_id (unsigned int, FK → roles.id)
  email_verified_at (timestamp, nullable)
  created_at / updated_at / deleted_at (soft deletes)

roles
  id (PK, unsigned int)
  name (unique, string 50)
  description (text, nullable)
  created_at / updated_at

2.2  Seeders  
     php artisan make:seeder RolesTableSeeder  
     Insert: admin, editor, user.

────────────────────────────────────────────────────────
3. Models & Relationships
────────────────────────────────────────────────────────
app/Models/User.php
  use SoftDeletes, JWTSubject
  fillable: name, email, password, role_id
  hidden: password, remember_token
  casts: email_verified_at => datetime
  relations: role() belongsTo
  implements: JWTSubject (getJWTIdentifier, getJWTCustomClaims)

app/Models/Role.php
  fillable: name, description
  hasMany users()

────────────────────────────────────────────────────────
4. Validation Rules
────────────────────────────────────────────────────────
app/Http/Requests/RegisterUserRequest
  name: required|string|max:255
  email: required|email|unique:users
  password: required|string|min:8|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/|regex:/[@$!%*?&]/|confirmed

app/Http/Requests/LoginUserRequest
  email: required|email
  password: required|string

app/Http/Requests/UpdateUserRequest
  name: sometimes|string|max:255
  email: sometimes|email|unique:users,email,{id}

app/Http/Requests/AssignRoleRequest
  role: required|string|exists:roles,name

────────────────────────────────────────────────────────
5. Middleware & Policies
────────────────────────────────────────────────────────
5.1  Role middleware (CheckRole)
     handle($request, $next, ...$roles) → 403 if not in list

5.2  Rate-limit middleware (ThrottleLogins) – uses Laravel cache
     key = ip + email
     max 5 attempts / 1 minute → 429 response

5.3  Register middleware in Kernel.php
     'role' => \App\Http\Middleware\CheckRole::class,
     'throttle:login' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':5,1'

5.4  UserPolicy
     viewAny, view, update, delete, assignRole

────────────────────────────────────────────────────────
6. Controllers
────────────────────────────────────────────────────────
app/Http/Controllers/Api/AuthController
  register(RegisterUserRequest $r) → 201 {user, token}
  login(LoginUserRequest $r) → 200 {user, token} or 401
  logout() → 200 {message}

app/Http/Controllers/Api/UserController
  show($id) → 200 {id, name, email, role, created_at}
  update(UpdateUserRequest $r, $id) → 200 {user}
  destroy($id) → 204 (admin only)

app/Http/Controllers/Api/RoleController
  index() → 200 [{id, name, description}]

app/Http/Controllers/Api/UserRoleController
  assignRole(AssignRoleRequest $r, $id) → 200 {user with role}

────────────────────────────────────────────────────────
7. Routes (routes/api.php)
────────────────────────────────────────────────────────
Route::prefix('users')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login'])
         ->middleware('throttle:5,1');

    Route::middleware('auth:api')->group(function () {
        Route::get('{id}', [UserController::class, 'show'])
             ->can('view', 'user');
        Route::put('{id}', [UserController::class, 'update'])
             ->can('update', 'user');
        Route::delete('{id}', [UserController::class, 'destroy'])
             ->middleware('role:admin');
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('roles', [RoleController::class, 'index']);
    Route::put('users/{id}/assign-role', [UserRoleController::class, 'assignRole'])
         ->middleware('role:admin');
});

────────────────────────────────────────────────────────
8. Security & Best Practices
────────────────────────────────────────────────────────
• Password hashing: Hash::make() (bcrypt)  
• JWT blacklist on logout  
• Hide password & sensitive fields in resources  
• Use API Resources for consistent output  
• Log successful/failed logins via Laravel’s Log facade  
• Add CORS & HTTPS enforcement in production  
• Sanitize inputs (Laravel’s built-in)  
• Return proper HTTP codes: 200, 201, 204, 400, 401, 403, 404, 409, 429, 500

────────────────────────────────────────────────────────
9. Testing (Pest only)
────────────────────────────────────────────────────────
tests/Feature/AuthTest.php
tests/Feature/UserTest.php
tests/Feature/RoleTest.php

Run: ./vendor/bin/pest

────────────────────────────────────────────────────────
10. Pre-commit Hook (Pest only)
────────────────────────────────────────────────────────
.pre-commit-config.yaml

Install & activate

────────────────────────────────────────────────────────
11. Deployment Notes
────────────────────────────────────────────────────────
• Run migrations & seeders  
• Generate fresh JWT secret  
• Configure queue for email verification (future)  
• Set APP_ENV=production, APP_DEBUG=false  
• Use Laravel Forge / Envoyer for zero-downtime deploys

────────────────────────────────────────────────────────
END OF PLAN
