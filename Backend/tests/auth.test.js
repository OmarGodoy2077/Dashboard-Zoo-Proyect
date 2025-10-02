const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('Should register a new user with valid data', async () => {
      const userData = {
        nombre: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123!',
        rol: 'empleado'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).not.toHaveProperty('contraseña_hash');
    });

    test('Should reject registration with invalid email', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'invalid-email',
        password: 'TestPass123!',
        rol: 'empleado'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('Should reject registration with weak password', async () => {
      const userData = {
        nombre: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: '123',
        rol: 'empleado'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    // Nota: Este test requiere un usuario ya registrado en la base de datos
    test('Should login with valid credentials', async () => {
      // Primero registrar un usuario
      const userData = {
        nombre: 'Login Test User',
        email: `logintest${Date.now()}@example.com`,
        password: 'TestPass123!',
        rol: 'empleado'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Luego intentar login
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
    });

    test('Should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('Should return user profile with valid token', async () => {
      // Primero registrar y obtener token
      const userData = {
        nombre: 'Profile Test User',
        email: `profiletest${Date.now()}@example.com`,
        password: 'TestPass123!',
        rol: 'empleado'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
    });

    test('Should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    test('Should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});