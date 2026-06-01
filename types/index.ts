// Роли пользователя
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Статус пользователя
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

// Интерфейс пользователя
export interface IUser {
  id: string;
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTO для регистрации
export interface ICreateUserDTO {
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
}

// DTO для авторизации
export interface ILoginDTO {
  email: string;
  password: string;
}

// DTO для обновления пользователя
export interface IUpdateUserDTO {
  fullName?: string;
  birthDate?: Date;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Ответ с токеном
export interface IAuthResponse {
  token: string;
  user: Omit<IUser, 'password'>;
}

// Пользователь без пароля
export type SafeUser = Omit<IUser, 'password'>;

// JWT payload
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
