const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/config/database');
const bcrypt = require('bcrypt');

describe('User Management System Tests', () => {
  let adminToken;
  let userToken;
  let userId;
  let adminUserId;

  beforeAll(async () => {
    // Wait for database initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up test database
    await new Promise(resolve => {
      db.serialize(() => {
        db.run('DELETE FROM users WHERE email LIKE "%@example.com"', resolve);
      });
    });
  });

  afterAll((done) => {
    db.close(done);
  });

  beforeEach(async () => {
    // Clean up before each test
    await new Promise(resolve => {
      db.serialize(() => {
        db.run('DELETE FROM users WHERE email LIKE "%@example.com"', resolve);
      });
    });
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'testuser@example.com',
          password: 'Test@1234',
          name: 'Test User'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('testuser@example.com');
      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'weak@example.com',
          password: '123',
          name: 'Weak Password'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test@1234',
          name: 'First User'
        });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test@1234',
          name: 'Duplicate User'
        });
      
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'logintest@example.com',
          password: 'Login@1234',
          name: 'Login Test'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'Login@1234'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('logintest@example.com');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'profiletest@example.com',
          password: 'Profile@1234',
          name: 'Profile Test'
        });
      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('profiletest@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`);
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'updatetest@example.com',
          password: 'Update@1234',
          name: 'Update Test'
        });
      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should update user profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
    });
  });

  describe('Admin Operations', () => {
    beforeEach(async () => {
      // Create admin user
      const password_hash = await bcrypt.hash('Admin@1234', 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password_hash, name, role_id) VALUES (?, ?, ?, 1)',
          ['admintest@example.com', password_hash, 'Admin Test'],
          function(err) {
            if (err) reject(err);
            else {
              adminUserId = this.lastID;
              resolve();
            }
          }
        );
      });

      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: 'admintest@example.com',
          password: 'Admin@1234'
        });
      
      adminToken = loginRes.body.token;

      // Create regular user for testing
      const userRes = await request(app)
        .post('/api/users/register')
        .send({
          email: 'regulartest@example.com',
          password: 'Regular@1234',
          name: 'Regular Test'
        });
      userToken = userRes.body.token;
      userId = userRes.body.user.id;
    });

    it('should list all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('should list all roles', async () => {
      const res = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.roles).toBeInstanceOf(Array);
      expect(res.body.roles.length).toBeGreaterThan(0);
    });

    it('should assign role to user (admin only)', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}/assign-role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role_id: 2
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user.role_id).toBe(2);
    });

    it('should delete user (admin only)', async () => {
      // Create a test user to delete
      const deleteRes = await request(app)
        .post('/api/users/register')
        .send({
          email: 'todelete@example.com',
          password: 'Delete@1234',
          name: 'To Delete'
        });

      const deleteUserId = deleteRes.body.user.id;

      const res = await request(app)
        .delete(`/api/users/${deleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
    });
  });
});