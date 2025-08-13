# User Management System API Documentation

This document provides comprehensive documentation for the User Management System API with Role-Based Access Control.

## Table of Contents
1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
   - [Register User](#register-user)
   - [Login User](#login-user)
   - [Get User Profile](#get-user-profile)
   - [Update User Profile](#update-user-profile)
   - [Delete User](#delete-user)
   - [Assign Role](#assign-role)
3. [Role Endpoints](#role-endpoints)
   - [List Roles](#list-roles)
4. [Error Responses](#error-responses)

## Authentication

Most endpoints require authentication using a JWT token. The token should be included in the Authorization header as a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are obtained by registering a new user or logging in with existing credentials.

## User Endpoints

### Register User

Registers a new user in the system.

**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string"
  }
}
```

**Status Codes:**
- 201: User registered successfully
- 400: Validation error
- 409: User with this email already exists
- 500: Server error

### Login User

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/users/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string"
  }
}
```

**Status Codes:**
- 200: Login successful
- 400: Validation error
- 401: Invalid credentials
- 429: Too many login attempts
- 500: Server error

### Get User Profile

Retrieves a user's profile information.

**Endpoint:** `GET /api/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

**Status Codes:**
- 200: User profile retrieved successfully
- 401: Authentication required
- 403: Access denied
- 404: User not found
- 500: Server error

### Update User Profile

Updates a user's profile information.

**Endpoint:** `PUT /api/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string"
}
```

**Response:**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

**Status Codes:**
- 200: User profile updated successfully
- 400: Validation error
- 401: Authentication required
- 403: Access denied
- 404: User not found
- 500: Server error

### Delete User

Deletes a user from the system (admin only).

**Endpoint:** `DELETE /api/users/:id`

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

**Status Codes:**
- 200: User deleted successfully
- 401: Authentication required
- 403: Insufficient permissions
- 404: User not found
- 500: Server error

### Assign Role

Assigns a role to a user (admin only).

**Endpoint:** `PUT /api/users/:id/role`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "string"
}
```

**Response:**
```json
{
  "message": "Role assigned successfully",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

**Status Codes:**
- 200: Role assigned successfully
- 400: Validation error
- 401: Authentication required
- 403: Insufficient permissions
- 404: User or role not found
- 500: Server error

## Role Endpoints

### List Roles

Retrieves all available roles in the system.

**Endpoint:** `GET /api/roles`

**Response:**
```json
{
  "roles": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
}
```

**Status Codes:**
- 200: Roles retrieved successfully
- 500: Server error

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