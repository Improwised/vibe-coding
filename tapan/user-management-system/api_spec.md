# API Specification

## Authentication
`POST /api/auth/login`
- Request:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- Response (200):
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "int",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

## User Profile
`GET /api/users/me`
- Headers:
  - Authorization: Bearer {token}
- Response (200):
  ```json
  {
    "id": "int",
    "name": "string",
    "email": "string",
    "role": "string",
    "created_at": "datetime"
  }
  ```

`PUT /api/users/me`
- Headers:
  - Authorization: Bearer {token}
- Request:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string" 
  }
  ```
- Response (200):
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

## Role Management
`GET /api/roles`
- Headers:
  - Authorization: Bearer {token}
- Response (200):
  ```json
  [
    {
      "id": "int",
      "name": "string",
      "description": "string"
    }
  ]
  ```

`POST /api/roles`
- Headers:
  - Authorization: Bearer {token}
- Request:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- Response (201):
  ```json
  {
    "id": "int",
    "name": "string",
    "description": "string"
  }
  ```

## Error Responses
- 400 Bad Request:
  ```json
  {
    "error": "Validation failed",
    "details": {
      "field": ["error1", "error2"]
    }
  }
  ```

- 401 Unauthorized:
  ```json
  {
    "error": "Authentication required"
  }
  ```

- 403 Forbidden:
  ```json
  {
    "error": "Insufficient permissions",
    "required_role": "string",
    "current_role": "string"
  }
  ```

- 404 Not Found:
  ```json
  {
    "error": "Resource not found"
  }
