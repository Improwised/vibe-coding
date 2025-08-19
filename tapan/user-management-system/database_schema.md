# Database Schema Design

## Tables Structure

### users
| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Unique user identifier |
| email | varchar(255) (unique) | User email address |
| password_hash | varchar(255) | Hashed password |
| role_id | bigint (FK) | Reference to roles table |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

### roles
| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Unique role identifier |
| name | varchar(50) (unique) | Role name (admin, editor, user) |
| description | text | Role description |

## Relationships
- One-to-many: roles → users (one role can have many users)

## Indexes
- users.email (unique)
- users.role_id (foreign key)
- roles.name (unique)

## Sample Data

### roles
```sql
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access'),
('editor', 'Content editing privileges'),
('user', 'Basic user access');
```

### users
```sql
INSERT INTO users (email, password_hash, role_id) VALUES
('admin@example.com', '$2y$10$...', 1),
('editor@example.com', '$2y$10$...', 2),
('user@example.com', '$2y$10$...', 3);