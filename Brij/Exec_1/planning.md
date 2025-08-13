# 🛡️ User Management System Specification

A secure and scalable API for managing user accounts, authentication, and role-based access control.

---

## 📌 Overview

This system provides endpoints for user registration, login, profile management, and role assignment. It ensures security through password hashing, JWT-based authentication, and role-based authorization.

---

## 🗂️ Database Schema

### 🧑 Users Table

| Field          | Type         | Description                              |
|----------------|--------------|------------------------------------------|
| id             | UUID / INT   | Unique identifier                        |
| email          | VARCHAR      | Unique user email                        |
| password_hash  | TEXT         | Hashed password                          |
| role_id        | INT / UUID   | Foreign key to roles table               |
| name           | VARCHAR      | Optional user name                       |
| created_at     | TIMESTAMP    | Account creation time                    |
| updated_at     | TIMESTAMP    | Last profile update                      |

### 🛡️ Roles Table

| Field        | Type       | Description                              |
|--------------|------------|------------------------------------------|
| id           | INT / UUID | Unique identifier                        |
| name         | VARCHAR    | Role name (e.g., admin, editor, user)    |
| description  | TEXT       | Role description                         |

---

## 🔐 Security Features

- **Password Hashing**: Use `bcrypt` for secure one-way password hashing.
- **Authentication**: Implement JWT for stateless authentication.
- **Authorization**: Middleware to enforce role-based access control.
- **Rate Limiting**: Protect login endpoint from brute-force attacks.
- **Sensitive Data Protection**: Never expose passwords or tokens in logs or responses.
- **Logging**: Log login attempts, role changes, and critical errors.

---

## 🚀 API Endpoints

### 1. `POST /api/users/register` — Register User

**Description**: Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!",
  "name": "John Doe"
}
```

**Validations**:
- Email format
- Unique email
- Password strength (min 8 chars, 1 special char, 1 number)

**Responses**:
- 201 Created: User registered
- 400 Bad Request: Validation error
- 409 Conflict: Email already exists

### 2. `POST /api/users/login` — Authenticate User

**Description**: Login and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongP@ssw0rd!"
}
```

**Validations**:
- Correct credentials
- Rate limiting on failed attempts

**Responses**:
- 200 OK: JWT token returned
- 401 Unauthorized: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded

### 3. `GET /api/users/{id}` — Get User Profile

**Description**: Retrieve public profile of a user.

**Headers**: `Authorization: Bearer <token>`

**Validations**:
- Valid user ID
- Authenticated user
- Permission to view

**Responses**:
- 200 OK: User profile
- 403 Forbidden: Unauthorized access
- 404 Not Found: User not found

### 4. `PUT /api/users/{id}` — Update User Profile

**Description**: Update profile info or role (admin only).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Jane Doe",
  "role_id": 2
}
```

**Validations**:
- Valid user ID
- Authenticated user or admin
- Valid fields

**Responses**:
- 200 OK: Profile updated
- 403 Forbidden: Unauthorized
- 404 Not Found: User not found

### 5. `DELETE /api/users/{id}` — Delete User

**Description**: Delete a user account (admin only).

**Headers**: `Authorization: Bearer <token>`

**Validations**:
- Valid user ID
- Admin permission

**Responses**:
- 200 OK: User deleted
- 403 Forbidden: Unauthorized
- 404 Not Found: User not found

### 6. `GET /api/roles` — List Roles

**Description**: Retrieve all available roles.

**Headers**: `Authorization: Bearer <token>`

**Responses**:
- 200 OK: List of roles

### 7. `PUT /api/users/{id}/assign-role` — Assign Role

**Description**: Assign a role to a user (admin only).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "role_id": 1
}
```

**Validations**:
- Valid user ID
- Valid role ID
- Admin permission

**Responses**:
- 200 OK: Role assigned
- 403 Forbidden: Unauthorized
- 404 Not Found: User or role not found