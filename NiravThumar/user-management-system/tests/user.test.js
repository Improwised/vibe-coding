const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');
const Role = require('../models/Role');

describe('User Management API', () => {
  let testUser;
  let adminUser;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/usermanagement_test',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});
    await Role.deleteMany({});

    // Create default roles
    const userRole = await Role.create({
      name: 'user',
      description: 'Standard user',
    });

    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator',
    });

    // Create test users through the registration API to ensure proper password hashing
    const userRegister = await request(app).post('/api/users/register').send({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    });

    const adminRegister = await request(app).post('/api/users/register').send({
      email: 'admin@example.com',
      password: 'password123',
      first_name: 'Admin',
      last_name: 'User',
    });

    // Get the created users from the database
    testUser = await User.findOne({ email: 'test@example.com' });
    adminUser = await User.findOne({ email: 'admin@example.com' });

    // Assign admin role to admin user
    adminUser.role_id = adminRole._id;
    await adminUser.save();

    // Login to get tokens
    const userLogin = await request(app).post('/api/users/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    userToken = userLogin.body.token;

    const adminLogin = await request(app).post('/api/users/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });

    adminToken = adminLogin.body.token;
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/users/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should not register a user with existing email', async () => {
      // First register a user
      await request(app).post('/api/users/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });

      // Try to register the same email again
      const response = await request(app).post('/api/users/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user with correct credentials', async () => {
      const response = await request(app).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login a user with incorrect credentials', async () => {
      const response = await request(app).post('/api/users/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not get profile of another user without admin role', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User profile updated successfully');
      expect(response.body.user.first_name).toBe('Updated');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin role', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should not delete user without admin role', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });
});
