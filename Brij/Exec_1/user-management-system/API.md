# User Management System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Register User
**POST** `/users/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!",
  "name": "John Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one letter
- At least one number
- At least one special character (@$!%*#?&)

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role_id": 3
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login User
**POST** `/users/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get User Profile
**GET** `/users/{id}`

Retrieve user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role_id": 3,
    "role_name": "user",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Profile
**PUT** `/users/{id}`

Update user profile information or role (admin only for role changes).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "role_id": 2
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "role_id": 2,
    "role_name": "editor",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete User
**DELETE** `/users/{id}`

Delete a user account (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 6. List All Users
**GET** `/users`

Get all users (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role_id": 3,
      "role_name": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 7. Assign Role to User
**PUT** `/users/{id}/assign-role`

Assign a role to a user (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role_id": 2
}
```

**Response:**
```json
{
  "message": "Role assigned successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role_id": 2,
    "role_name": "editor",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. List All Roles
**GET** `/roles`

Get all available roles.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrator with full access"
    },
    {
      "id": 2,
      "name": "editor",
      "description": "Editor with limited admin access"
    },
    {
      "id": 3,
      "name": "user",
      "description": "Regular user with basic access"
    }
  ]
}
```

### 9. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many login attempts",
  "retryAfter": "15 minutes"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
- Login endpoint: 5 attempts per 15 minutes per IP
- General API: 100 requests per 15 minutes per IP

## Default Roles
1. **admin** - Full system access
2. **editor** - Limited admin access
3. **user** - Basic user access

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Rate limiting
- Input validation
- Security headers with Helmet
- CORS protection
- Comprehensive logging