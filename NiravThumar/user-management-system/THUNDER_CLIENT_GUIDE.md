# Thunder Client Testing Guide

This guide provides detailed instructions for testing all endpoints of the User Management System using Thunder Client in VS Code.

## Prerequisites

1. Install Thunder Client extension in VS Code
2. Start the application: `npm start` (or `npm run dev` for development)
3. Ensure MongoDB is running (either locally or via Docker)

## Environment Setup

Create a new environment in Thunder Client with the following variables:
- `baseUrl`: http://localhost:3000
- `userId`: (will be set after registration)
- `adminId`: (will be set after creating an admin user)
- `userToken`: (will be set after user login)
- `adminToken`: (will be set after admin login)

## Endpoint Testing Guide

### 1. Health Check
**Method**: GET  
**URL**: `{{baseUrl}}/health`  
**Description**: Check if the server is running  
**Expected Response**: 
```json
{
  "status": "OK",
  "message": "User Management System is running"
}
```

### 2. Role Endpoints

#### Get All Roles
**Method**: GET  
**URL**: `{{baseUrl}}/api/roles`  
**Description**: Retrieve all available roles  
**Headers**: None required  
**Expected Response**:
```json
{
  "roles": [
    {
      "id": "role_id",
      "name": "admin",
      "description": "Administrator with full access"
    },
    {
      "id": "role_id",
      "name": "editor",
      "description": "Editor with content management access"
    },
    {
      "id": "role_id",
      "name": "user",
      "description": "Standard user"
    }
  ]
}
```

### 3. User Endpoints

#### Register User
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/register`  
**Description**: Register a new user  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123!",
  "first_name": "Test",
  "last_name": "User"
}
```
**Expected Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "user"
  }
}
```
**After Testing**: Save the `user.id` as `userId` and `token` as `userToken` in your environment.

#### Login User
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/login`  
**Description**: Authenticate a user  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123!"
}
```
**Expected Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "user"
  }
}
```
**After Testing**: Save the `token` as `userToken` in your environment.

#### Get User Profile (Own)
**Method**: GET  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Retrieve own user profile  
**Headers**: 
- Authorization: Bearer {{userToken}}
**Expected Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "user",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Get User Profile (Other - Should Fail)
**Method**: GET  
**URL**: `{{baseUrl}}/api/users/some_other_user_id`  
**Description**: Try to access another user's profile (should fail without admin role)  
**Headers**: 
- Authorization: Bearer {{userToken}}
**Expected Response**:
```json
{
  "message": "Access denied"
}
```
Status Code: 403

#### Update User Profile (Own)
**Method**: PUT  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Update own user profile  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer {{userToken}}
**Body**:
```json
{
  "first_name": "Updated",
  "last_name": "Name"
}
```
**Expected Response**:
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "testuser@example.com",
    "first_name": "Updated",
    "last_name": "Name"
  }
}
```

#### Update User Profile (Other - Should Fail)
**Method**: PUT  
**URL**: `{{baseUrl}}/api/users/some_other_user_id`  
**Description**: Try to update another user's profile (should fail without admin role)  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer {{userToken}}
**Body**:
```json
{
  "first_name": "Hacked",
  "last_name": "Name"
}
```
**Expected Response**:
```json
{
  "message": "Access denied"
}
```
Status Code: 403

#### Create Admin User
First, register a new user:
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/register`  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "first_name": "Admin",
  "last_name": "User"
}
```

Then assign admin role (requires admin token, so you'll need to manually assign the role in the database initially or use the seed script):
**Method**: PUT  
**URL**: `{{baseUrl}}/api/users/{{adminId}}/role`  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer {{adminToken}}
**Body**:
```json
{
  "role": "admin"
}
```

#### Login as Admin
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/login`  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```
**After Testing**: Save the `token` as `adminToken` in your environment.

#### Get Any User Profile (Admin)
**Method**: GET  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Admin accessing another user's profile  
**Headers**: 
- Authorization: Bearer {{adminToken}}
**Expected Response**: Full user profile data

#### Update Any User Profile (Admin)
**Method**: PUT  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Admin updating another user's profile  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer {{adminToken}}
**Body**:
```json
{
  "first_name": "AdminUpdated",
  "last_name": "User"
}
```

#### Delete User (Admin)
**Method**: DELETE  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Admin deleting a user  
**Headers**: 
- Authorization: Bearer {{adminToken}}
**Expected Response**:
```json
{
  "message": "User deleted successfully"
}
```

#### Delete User (Non-Admin - Should Fail)
**Method**: DELETE  
**URL**: `{{baseUrl}}/api/users/{{adminId}}`  
**Description**: Non-admin trying to delete a user  
**Headers**: 
- Authorization: Bearer {{userToken}}
**Expected Response**:
```json
{
  "message": "Insufficient permissions"
}
```
Status Code: 403

## Error Testing

### Invalid Credentials Login
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/login`  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "testuser@example.com",
  "password": "WrongPassword"
}
```
**Expected Response**:
```json
{
  "message": "Invalid credentials"
}
```
Status Code: 401

### Duplicate Registration
**Method**: POST  
**URL**: `{{baseUrl}}/api/users/register`  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "testuser@example.com",  // Same email as already registered
  "password": "AnotherPass123!",
  "first_name": "Test",
  "last_name": "User"
}
```
**Expected Response**:
```json
{
  "message": "User with this email already exists"
}
```
Status Code: 409

### Missing Authorization Token
**Method**: GET  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Accessing protected endpoint without token  
**Headers**: None
**Expected Response**:
```json
{
  "message": "Access token required"
}
```
Status Code: 401

### Invalid Token
**Method**: GET  
**URL**: `{{baseUrl}}/api/users/{{userId}}`  
**Description**: Accessing protected endpoint with invalid token  
**Headers**: 
- Authorization: Bearer invalid_token_here
**Expected Response**:
```json
{
  "message": "Invalid or expired token"
}
```
Status Code: 403

## Testing Tips

1. **Order of Testing**: 
   - Start with health check
   - Register a user
   - Login to get token
   - Test profile operations
   - Create admin user
   - Test admin operations

2. **Environment Variables**: 
   - Always update environment variables after registration/login
   - Use different tokens for user and admin operations

3. **Rate Limiting**: 
   - Be aware that too many login attempts will trigger rate limiting
   - Wait for rate limit window to reset if triggered

4. **Database State**: 
   - Tests may affect database state
   - Consider using a separate test database
   - The test suite uses a separate test database

5. **Role Assignment**: 
   - Initially, all new users get the "user" role
   - Role assignment requires admin privileges
   - You may need to manually update a user's role in the database for initial admin setup

## Complete Endpoint List

### Public Endpoints
- GET `/health` - Server health check
- GET `/api/roles` - List all roles
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login

### User Endpoints (Require Authentication)
- GET `/api/users/:id` - Get user profile
- PUT `/api/users/:id` - Update user profile
- DELETE `/api/users/:id` - Delete user (admin only)
- PUT `/api/users/:id/role` - Assign role to user (admin only)

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

Tokens are obtained through successful registration or login and expire after 24 hours by default.