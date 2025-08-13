# API Specification

## Authentication Endpoints

### POST /api/users/register
- **Description**: Register new user
- **Request Body**:
  ```json
  {
    "email": "string (valid email format)",
    "password": "string (min 8 chars, special chars, numbers)"
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "id": "string",
    "email": "string",
    "role": "string",
    "created_at": "timestamp"
  }
  ```
- **Error Responses**:
  - 400 Bad Request (validation errors)
  - 409 Conflict (email already exists)

### POST /api/users/login
- **Description**: Authenticate user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "token": "JWT string",
    "expires_in": "seconds"
  }
  ```
- **Error Responses**:
  - 400 Bad Request (validation errors)
  - 401 Unauthorized (invalid credentials)
  - 429 Too Many Requests (rate limited)

## User Management Endpoints

### GET /api/users/{id}
- **Description**: Get user profile
- **Authentication**: Required (JWT)
- **Success Response**: 200 OK
  ```json
  {
    "id": "string",
    "email": "string",
    "role": "string",
    "created_at": "timestamp"
  }
  ```
- **Error Responses**:
  - 401 Unauthorized
  - 403 Forbidden (no permission)
  - 404 Not Found

[Additional endpoints would follow the same format...]