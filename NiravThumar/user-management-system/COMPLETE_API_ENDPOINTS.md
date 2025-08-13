# Complete API Endpoints Guide

This document provides a complete list of all API endpoints available in the User Management System, including how to use them.

## Getting Started

1. **Start the server**: `npm start`
2. **Seed default roles**: `npm run seed` (run this once to populate the database with default roles)
3. **Test endpoints**: Use Thunder Client or any HTTP client

## Base URL
```
http://localhost:3000
```

## Public Endpoints

### Health Check
**Endpoint**: `GET /health`  
**Description**: Check if the server is running  
**Response**:
```json
{
  "status": "OK",
  "message": "User Management System is running"
}
```

### Get All Roles
**Endpoint**: `GET /api/roles`  
**Description**: Retrieve all available roles  
**Response**:
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

### Register User
**Endpoint**: `POST /api/users/register`  
**Description**: Register a new user  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "First",
  "last_name": "Last"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "First",
    "last_name": "Last",
    "role": "user"
  }
}
```

### Login User
**Endpoint**: `POST /api/users/login`  
**Description**: Authenticate a user  
**Headers**: 
- Content-Type: application/json
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "First",
    "last_name": "Last",
    "role": "user"
  }
}
```

## Protected Endpoints (Require Authentication Token)

### Get User Profile
**Endpoint**: `GET /api/users/:id`  
**Description**: Retrieve user profile information  
**Headers**: 
- Authorization: Bearer your_jwt_token_here
**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "First",
    "last_name": "Last",
    "role": "user",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User Profile
**Endpoint**: `PUT /api/users/:id`  
**Description**: Update user profile information  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer your_jwt_token_here
**Body**:
```json
{
  "first_name": "UpdatedFirst",
  "last_name": "UpdatedLast"
}
```
**Response**:
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "UpdatedFirst",
    "last_name": "UpdatedLast"
  }
}
```

### Assign Role to User (Admin Only)
**Endpoint**: `PUT /api/users/:id/role`  
**Description**: Assign a role to a user (admin only)  
**Headers**: 
- Content-Type: application/json
- Authorization: Bearer admin_jwt_token_here
**Body**:
```json
{
  "role": "admin"  // Can be "admin", "editor", or "user"
}
```
**Response**:
```json
{
  "message": "Role assigned successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Delete User (Admin Only)
**Endpoint**: `DELETE /api/users/:id`  
**Description**: Delete a user (admin only)  
**Headers**: 
- Authorization: Bearer admin_jwt_token_here
**Response**:
```json
{
  "message": "User deleted successfully"
}
```

## Setting Up Your First Admin User

To create your first admin user, follow these steps:

1. **Register a new user** using the `/api/users/register` endpoint
2. **Run the seed script** to ensure roles exist:
   ```bash
   npm run seed
   ```
3. **Manually update the user's role in the database** to "admin" (since you don't have an admin token yet):
   - Connect to your MongoDB database
   - Find the user document you just created
   - Update their role_id to match the admin role ID from the roles collection
4. **Login as that user** to get an admin token
5. **Use the admin token** for admin-only operations

Alternatively, you can use a database GUI tool like MongoDB Compass or the mongo shell to directly update the user's role.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

Tokens are obtained through successful registration or login and expire after 24 hours by default.

## Error Responses

The API uses standard HTTP status codes to indicate the success or failure of requests. In case of an error, the response body will contain a JSON object with an error message:

```json
{
  "message": "Error description"
}
```

Common error responses:
- 400: Bad Request - The request was malformed or missing required parameters
- 401: Unauthorized - Authentication is required but missing or invalid
- 403: Forbidden - The authenticated user does not have permission to perform this action
- 404: Not Found - The requested resource could not be found
- 409: Conflict - The request conflicts with the current state of the server
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - An unexpected error occurred on the server

## Rate Limiting

The API implements rate limiting to prevent abuse:
- General requests: 100 requests per 15 minutes
- Login attempts: 5 attempts per 15 minutes

Exceeding these limits will result in a 429 status code.

## Testing with Thunder Client

1. Install Thunder Client extension in VS Code
2. Create a new environment with variables:
   - `baseUrl`: http://localhost:3000
   - `userId`: (set after registration)
   - `userToken`: (set after login)
3. Import the requests from the examples above
4. Test the endpoints in order:
   - Start with health check
   - Register a user
   - Login to get token
   - Test profile operations