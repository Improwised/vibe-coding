# User Management System with Role-Based Access Control

A comprehensive user management system built with Node.js, Express, and MongoDB that provides secure authentication, role-based access control, and a complete set of user management features.

## Features

- User registration and authentication with JWT tokens
- Role-based access control (RBAC) with predefined roles (admin, editor, user)
- User profile management (CRUD operations)
- Password hashing with bcrypt
- Rate limiting for security
- Input validation and comprehensive error handling
- Detailed logging with Winston
- Pre-commit hooks with ESLint and Prettier
- Docker configuration for MongoDB
- Comprehensive test suite with Jest
- Complete API documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- Docker (optional, for MongoDB containerization)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd user-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/usermanagement
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

4. Seed the database with default roles:
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### With Docker

1. Start MongoDB container:
   ```bash
   docker-compose up -d
   ```

2. Run the application:
   ```bash
   npm start
   ```

## Running Tests

```bash
npm test
```

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed information about all available endpoints, request/response formats, and authentication requirements.

## Project Structure

```
user-management-system/
├── controllers/
│   ├── userController.js
│   └── roleController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validation.js
├── models/
│   ├── User.js
│   └── Role.js
├── routes/
│   ├── users.js
│   └── roles.js
├── scripts/
│   └── seedRoles.js
├── tests/
│   └── user.test.js
├── utils/
│   └── logger.js
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── API_DOCUMENTATION.md
├── docker-compose.yml
├── package.json
├── server.js
└── README.md
```

## Security Features

- Passwords are hashed using bcrypt with a cost factor of 12
- JWT tokens with expiration for secure authentication
- Rate limiting to prevent brute force attacks
- Input validation to prevent injection attacks
- Role-based access control to protect sensitive operations
- Detailed logging for security monitoring

## Default Roles

The system comes with three predefined roles:

1. **admin** - Full access to all system features
2. **editor** - Can manage content but not users or roles
3. **user** - Standard user with limited permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure nothing is broken
5. Commit your changes
6. Push to the branch
7. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository.
