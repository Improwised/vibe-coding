# User Management System

A Laravel-based API for managing users, roles, and permissions with JWT authentication.

## Features
- User registration and authentication
- Role-based access control (RBAC)
- User profile management
- Role administration
- JWT authentication
- Input validation
- Rate limiting
- Comprehensive API documentation

## Requirements
- PHP 8.1+
- Composer
- MySQL 8.0+
- Laravel 10+

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/user-management-system.git
   cd user-management-system
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Update `.env` with your database credentials.

4. Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

5. Generate JWT secret:
   ```bash
   php artisan jwt:secret
   ```

## Running the Application
```bash
php artisan serve
```
The API will be available at `http://localhost:8000`

## Testing
Run all tests:
```bash
php artisan test
```

## API Documentation
View the OpenAPI specification: [api_spec.yaml](api_spec.yaml)

You can use tools like:
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)

To import and explore the API documentation.

## Usage Examples
### User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment
For production deployment:
1. Configure environment variables properly
2. Set up a web server (Nginx/Apache)
3. Optimize the application:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. Set up task scheduling (if needed)
5. Implement proper monitoring and logging

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
