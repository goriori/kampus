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
import {
  createUserInDb,
  createTaskInDb,
  generateToken,
} from './helpers/test-utils';
import { User, Task } from '../models';
import { TaskStatus } from '../types';

describe('TaskController (integration)', () => {
  let app: any;
  let sequelize: any;

  let adminUser: any;
  let adminToken: string;

  let regularUser: any;
  let regularToken: string;

  let otherUser: any;
  let otherToken: string;

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
      role: 'admin',
    });
    adminToken = generateToken(adminUser);

    regularUser = await createUserInDb({ email: 'regular@test.com' });
    regularToken = generateToken(regularUser);

    otherUser = await createUserInDb({ email: 'other@test.com' });
    otherToken = generateToken(otherUser);
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await createTaskInDb({
        title: 'Regular task',
        userId: regularUser.get('id'),
      });
      await createTaskInDb({
        title: 'Other user task',
        userId: otherUser.get('id'),
      });
      await createTaskInDb({ title: 'Public task', userId: null });
    });

    test('админ видит все задачи', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(3);
    });

    test('обычный пользователь видит свои + публичные задачи', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(200);
      const titles = res.body.data.items.map((t: any) => t.title);
      expect(titles).toContain('Regular task');
      expect(titles).toContain('Public task');
    });

    test('без токена → 401', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    test('фильтрация по статусу', async () => {
      await createTaskInDb({
        title: 'Completed task',
        userId: regularUser.get('id'),
        status: TaskStatus.COMPLETED,
      });
      const res = await request(app)
        .get(`/api/tasks?status=${TaskStatus.COMPLETED}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].status).toBe(TaskStatus.COMPLETED);
    });

    test('поиск по title или description', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Regular')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].title).toContain('Regular');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let publicTask: any;
    let userTask: any;
    let otherUserTask: any;

    beforeEach(async () => {
      publicTask = await createTaskInDb({ title: 'Public', userId: null });
      userTask = await createTaskInDb({
        title: 'User task',
        userId: regularUser.get('id'),
      });
      otherUserTask = await createTaskInDb({
        title: 'Other task',
        userId: otherUser.get('id'),
      });
    });

    test('пользователь не может получить публичную задачу', async () => {
      const res = await request(app)
        .get(`/api/tasks/${publicTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(403);
    });

    test('пользователь НЕ может получить чужую задачу (403)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${otherUserTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(403);
    });

    test('админ может получить любую задачу', async () => {
      const res = await request(app)
        .get(`/api/tasks/${otherUserTask.get('id')}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('404 при неверном id', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/tasks', () => {
    test('пользователь может создать задачу для себя (без userId)', async () => {
      const payload = {
        title: 'My new task',
        description: 'Do something',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2025-12-31',
      };
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBe(regularUser.get('id'));
      expect(res.body.data.title).toBe(payload.title);
    });

    test('админ может создать задачу для другого пользователя (указав userId)', async () => {
      const payload = {
        title: 'Task for other',
        userId: otherUser.get('id'),
      };
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBe(otherUser.get('id'));
    });

    test('обязательное поле title → 400', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ description: 'no title' });
      expect(res.status).toBe(400);
    });

    test('неверный статус → 400 (ValidationMiddleware)', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Task', status: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let userTask: any;
    let publicTask: any;

    beforeEach(async () => {
      userTask = await createTaskInDb({
        title: 'Original',
        userId: regularUser.get('id'),
      });
      publicTask = await createTaskInDb({ title: 'Public', userId: null });
    });

    test('пользователь не может обновить свою задачу', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Updated title', status: TaskStatus.COMPLETED });
      expect(res.status).toBe(403);
    });

    test('пользователь не может обновить публичную задачу (userId === null)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${publicTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Updated public' });
      expect(res.status).toBe(403);
    });

    test('пользователь НЕ может обновить чужую задачу → 403', async () => {
      const otherTask = await createTaskInDb({
        title: 'Other',
        userId: otherUser.get('id'),
      });
      const res = await request(app)
        .put(`/api/tasks/${otherTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ title: 'Hack' });
      expect(res.status).toBe(403);
    });

    test('обычный пользователь не может сменить владельца (403)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ userId: otherUser.get('id') });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let userTask: any;
    let publicTask: any;

    beforeEach(async () => {
      userTask = await createTaskInDb({ userId: regularUser.get('id') });
      publicTask = await createTaskInDb({ userId: null });
    });

    test('пользователь не может удалить публичную задачу', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${publicTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(403);
    });

    test('пользователь НЕ может удалить чужую задачу → 403', async () => {
      const otherTask = await createTaskInDb({ userId: otherUser.get('id') });
      const res = await request(app)
        .delete(`/api/tasks/${otherTask.get('id')}`)
        .set('Authorization', `Bearer ${regularToken}`);
      expect(res.status).toBe(403);
    });

    test('админ может удалить любую задачу', async () => {
      const otherTask = await createTaskInDb({ userId: otherUser.get('id') });
      const res = await request(app)
        .delete(`/api/tasks/${otherTask.get('id')}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(204);
    });
  });

  describe('PATCH /api/tasks/status/bulk (только админ)', () => {
    let task1: any, task2: any;

    beforeEach(async () => {
      task1 = await createTaskInDb({
        title: 'Task 1',
        status: TaskStatus.PENDING,
      });
      task2 = await createTaskInDb({
        title: 'Task 2',
        status: TaskStatus.IN_PROGRESS,
      });
    });

    test('обычный пользователь получает 403', async () => {
      const res = await request(app)
        .patch('/api/tasks/status/bulk')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ taskIds: [task1.get('id')], status: TaskStatus.COMPLETED });
      expect(res.status).toBe(403);
    });

    test('некорректные taskIds → 400', async () => {
      const res = await request(app)
        .patch('/api/tasks/status/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ taskIds: ['not-a-uuid'], status: TaskStatus.COMPLETED });
      expect(res.status).toBe(400);
    });

    test('некоторые задачи не найдены → 400', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .patch('/api/tasks/status/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          taskIds: [task1.get('id'), fakeId],
          status: TaskStatus.COMPLETED,
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not found');
    });
  });
});
