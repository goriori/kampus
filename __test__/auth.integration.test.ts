import {
  describe,
  expect,
  test,
  beforeAll,
  afterAll,
  beforeEach,
} from 'bun:test';
import request from 'supertest';
import { createTestApp } from './helpers/test-server';
import { Task, User } from '../models';

describe('AuthController (integration)', () => {
  let app: any;
  let sequelize: any;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    sequelize = setup.sequelize;
  });

  afterAll(async () => {
    // await sequelize.close();
  });

  beforeEach(async () => {
    await Task.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    test('успешная регистрация → 201', async () => {
      const payload = {
        fullName: 'John Doe',
        birthDate: '1990-01-01',
        email: 'john@example.com',
        password: 'secret123',
      };
      const res = await request(app).post('/api/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toMatchObject({
        email: 'john@example.com',
        fullName: 'John Doe',
      });
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    test('отсутствие обязательных полей → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'only@email.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        fullName: 'Login User',
        birthDate: '1985-01-01',
        email: 'login@example.com',
        password: 'mypass',
      });
    });

    test('успешный логин → 200', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'mypass' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    test('неверный пароль → 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    test('несуществующий email → 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'any' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Current',
        birthDate: '1995-05-05',
        email: 'current@example.com',
        password: 'password123',
      });
      token = res.body.data.token;
    });

    test('доступ с валидным токеном → 200', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('current@example.com');
    });

    test('без токена → 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
