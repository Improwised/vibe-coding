# Database Schema Design

## Overview
This document outlines the database schema for the User Management System with Role-Based Access Control. The schema consists of two main collections: Users and Roles.

## Users Collection

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier for the user |
| email | String | Yes | User's email address (unique) |
| password_hash | String | Yes | Hashed password |
| role_id | ObjectId | Yes | Reference to the role assigned to the user |
| first_name | String | No | User's first name |
| last_name | String | No | User's last name |
| created_at | Date | Yes | Timestamp when the user was created |
| updated_at | Date | Yes | Timestamp when the user was last updated |
| last_login | Date | No | Timestamp of the last successful login |

### Indexes
- email (unique)
- role_id

## Roles Collection

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier for the role |
| name | String | Yes | Role name (unique) |
| description | String | No | Description of the role |
| permissions | Array | No | List of permissions associated with the role |
| created_at | Date | Yes | Timestamp when the role was created |
| updated_at | Date | Yes | Timestamp when the role was last updated |

### Indexes
- name (unique)

## Relationships
- Users have a many-to-one relationship with Roles (many users can have the same role)
- Roles can be assigned to multiple users

## Sample Documents

### User Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john.doe@example.com",
  "password_hash": "$2b$10$examplehashedpassword",
  "role_id": ObjectId("507f191e810c19729de860ea"),
  "first_name": "John",
  "last_name": "Doe",
  "created_at": ISODate("2023-01-01T00:00:00Z"),
  "updated_at": ISODate("2023-01-01T00:00:00Z"),
  "last_login": ISODate("2023-01-01T00:00:00Z")
}
```

### Role Document
```json
{
  "_id": ObjectId("507f191e810c19729de860ea"),
  "name": "admin",
  "description": "Administrator with full access",
  "permissions": ["user:create", "user:read", "user:update", "user:delete", "role:assign"],
  "created_at": ISODate("2023-01-01T00:00:00Z"),
  "updated_at": ISODate("2023-01-01T00:00:00Z")
}
```

## Default Roles
1. **admin** - Full access to all system features
2. **editor** - Can manage content and user profiles
3. **user** - Standard user with limited access

## Security Considerations
- Passwords are never stored in plain text
- Role-based access control is enforced at the application level
- All timestamps are stored in UTC
- Email addresses are case-insensitive for uniqueness but preserved as entered