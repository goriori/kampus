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
import { createUserInDb, generateToken } from './helpers/test-utils';
import { User, Task } from '../models';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../types';

describe('UserController (integration)', () => {
  let app: any;
  let sequelize: any;
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

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

    adminUser = await createUserInDb({
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    regularUser = await createUserInDb({
      email: 'user@test.com',
      role: UserRole.USER,
    });

    adminToken = generateToken(adminUser);
    userToken = generateToken(regularUser);
  });

  describe('GET /api/users', () => {
    test('админ может получить список пользователей', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('items');
    });

    test('обычный пользователь не может получить список (403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    test('пользователь может получить свой профиль', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(regularUser.get('id'));
    });

    test('админ может получить профиль любого пользователя', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('пользователь не может получить чужой профиль (403)', async () => {
      const otherUser = await createUserInDb();
      const res = await request(app)
        .get(`/api/users/${otherUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    test('404 при неверном id', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('пользователь может обновить свой профиль', async () => {
      const update = { fullName: 'Updated Name' };
      const res = await request(app)
        .put(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(update);
      expect(res.status).toBe(200);
      expect(res.body.data.user.fullName).toBe('Updated Name');
    });

    test('админ может обновить любого пользователя и роль', async () => {
      const res = await request(app)
        .put(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.ADMIN });
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(UserRole.ADMIN);
    });

    test('пользователь не может обновить чужой профиль (403)', async () => {
      const other = await createUserInDb();
      const res = await request(app)
        .put(`/api/users/${other.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fullName: 'Hack' });
      expect(res.status).toBe(403);
    });

    test('конфликт при смене email на уже существующий', async () => {
      await createUserInDb({ email: 'taken@test.com' });
      const res = await request(app)
        .put(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'taken@test.com' });
      expect(res.status).toBe(409);
    });

    test('обновление пароля – пароль хэшируется', async () => {
      const newPassword = 'newPass123';
      await request(app)
        .put(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: newPassword });

      const userWithPass = await User.scope('withPassword').findByPk(
        regularUser.get('id'),
      );
      const isMatch = await bcrypt.compare(
        newPassword,
        userWithPass?.get('password') as string,
      );
      expect(isMatch).toBe(true);
    });
  });

  describe('PATCH /api/users/:id/block', () => {
    test('админ может заблокировать пользователя', async () => {
      const res = await request(app)
        .patch(`/api/users/${regularUser.get('id')}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'block' });
      expect(res.status).toBe(200);
      expect(res.body.data.user.status).toBe(UserStatus.BLOCKED);
    });

    test('админ может разблокировать пользователя', async () => {
      await regularUser.update({ status: UserStatus.BLOCKED });
      const res = await request(app)
        .patch(`/api/users/${regularUser.get('id')}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'unblock' });
      expect(res.status).toBe(200);
      expect(res.body.data.user.status).toBe(UserStatus.ACTIVE);
    });

    test('обычный пользователь не может заблокировать другого (403)', async () => {
      const other = await createUserInDb();
      const res = await request(app)
        .patch(`/api/users/${other.get('id')}/block`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ action: 'block' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('админ может удалить другого пользователя', async () => {
      const target = await createUserInDb();
      const res = await request(app)
        .delete(`/api/users/${target.get('id')}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      const deleted = await User.findByPk(target.get('id'));
      expect(deleted).toBeNull();
    });

    test('пользователь не может удалить себя (403, требуется роль admin)', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser.get('id')}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });
});
