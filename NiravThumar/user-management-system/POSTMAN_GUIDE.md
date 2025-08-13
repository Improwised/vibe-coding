# Postman Testing Guide

This guide provides instructions for testing the User Management System API using the provided Postman collection.

## Prerequisites

1. Install Postman Desktop App
2. Start the application: `npm start` in the `NiravThumar/user-management-system` directory
3. Ensure MongoDB is running (either locally or via Docker)

## Importing the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select the file `NiravThumar/user-management-system/User Management System.postman_collection.json`
4. The collection will be imported with all API endpoints

## Environment Setup

The collection includes environment variables that need to be set during testing:

- `baseUrl`: http://localhost:3000 (default)
- `userId`: Will be set after user registration
- `userToken`: Will be set after user login
- `adminToken`: Will be set after admin login

## Testing Order

To properly test the API, follow this order:

### 1. Health Check
- Run the "Health Check" request to ensure the server is running

### 2. Get All Roles
- Run the "Get All Roles" request to verify roles exist
- This should work without authentication

### 3. Register a Regular User
- Run the "Register User" request
- Update the request body with your desired user information
- After successful registration, save the returned `user.id` as `userId` and `token` as `userToken` in your environment

### 4. Login as Regular User
- Run the "Login User" request
- Update the request body with your user credentials
- Save the returned `token` as `userToken` in your environment

### 5. Test User Operations
- Run "Get User Profile" to retrieve your own profile
- Run "Update User Profile" to modify your profile information

### 6. Register an Admin User
- Run the "Register Admin User" request
- Update the request body with admin user information

### 7. Manually Assign Admin Role
Since we don't have an admin token yet, you'll need to manually assign the admin role to your admin user:
1. Connect to your MongoDB database
2. Find the admin user document you just created
3. Update their role_id to match the admin role ID from the roles collection

### 8. Login as Admin
- Run the "Login Admin User" request
- Save the returned `token` as `adminToken` in your environment

### 9. Test Admin Operations
- Run "Assign Role to User" to change a user's role
- Run "Delete User" to remove a user from the system

## Setting Environment Variables

After each request that returns important data (like user ID or tokens), you should set the environment variables:

1. In the "Tests" tab of each request, you can add scripts to automatically set variables:
   ```javascript
   const response = pm.response.json();
   if (response.user && response.user.id) {
       pm.environment.set("userId", response.user.id);
   }
   if (response.token) {
       pm.environment.set("userToken", response.token);
   }
   ```

2. Or manually set them:
   - Click on the eye icon in the top right of Postman
   - Edit the current environment
   - Set the variable values

## Complete Testing Workflow

1. **Start the server**: `npm start`
2. **Clear existing user data**: `npm run clear-users` (if needed)
3. **Seed roles**: `npm run seed` (if needed)
4. **Import Postman collection**
5. **Test endpoints in order**:
   - Health Check
   - Get All Roles
   - Register User
   - Login User
   - Get User Profile
   - Update User Profile
   - Register Admin User
   - Manually assign admin role in database
   - Login Admin User
   - Assign Role to User
   - Delete User

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (user already exists)
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error (server issues)

Check the response body for detailed error messages.

## Security Notes

- Tokens expire after 24 hours by default
- Rate limiting is in place to prevent abuse
- Passwords are securely hashed using bcrypt
- All communication should happen over HTTPS in production

## Troubleshooting

1. **Server not running**: Ensure `npm start` is running
2. **Database connection issues**: Verify MongoDB is running
3. **Authentication errors**: Check that tokens are correctly set in environment variables
4. **Permission errors**: Ensure admin operations are performed with admin token
5. **Rate limiting**: Wait for the rate limit window to reset