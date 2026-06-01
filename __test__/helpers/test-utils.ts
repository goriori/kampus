import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Task } from '../../models';
import { config } from '../../configs';
import { UserRole, UserStatus, TaskStatus } from '../../types';

export async function createUserInDb(overrides: any = {}) {
  const defaultData = {
    fullName: 'Test User',
    birthDate: '1990-01-01',
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('password123', 10),
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };
  const user = await User.create({ ...defaultData, ...overrides });
  return user;
}

export function generateToken(user: any) {
  const payload = {
    userId: user.get('id'),
    email: user.get('email'),
    role: user.get('role'),
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export async function createTaskInDb(overrides: any = {}) {
  const defaultData = {
    title: 'Test task',
    description: 'Test description',
    status: TaskStatus.PENDING,
    dueDate: null,
    userId: null,
  };
  const task = await Task.create({ ...defaultData, ...overrides });
  return task;
}
