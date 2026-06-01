import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'User Service API',
    version: '1.0.0',
    description:
      'API для управления пользователями с аутентификацией и авторизацией',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT токен, полученный при авторизации. Пример: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Уникальный идентификатор пользователя',
          },
          fullName: {
            type: 'string',
            description: 'ФИО пользователя',
            example: 'Иванов Иван Иванович',
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Дата рождения',
            example: '1990-01-01',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email пользователя',
            example: 'user@example.com',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'Роль пользователя',
          },
          status: {
            type: 'string',
            enum: ['active', 'blocked'],
            description: 'Статус пользователя',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'birthDate', 'email', 'password'],
        properties: {
          fullName: {
            type: 'string',
            description: 'ФИО пользователя',
            example: 'Иванов Иван Иванович',
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Дата рождения',
            example: '1990-01-01',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email пользователя',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Пароль (минимум 6 символов)',
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'Email пользователя',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Пароль',
            example: 'password123',
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          fullName: {
            type: 'string',
            description: 'ФИО пользователя',
            example: 'Петров Петр Петрович',
          },
          birthDate: {
            type: 'string',
            format: 'date',
            description: 'Дата рождения',
            example: '1995-05-05',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email пользователя',
            example: 'newemail@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Новый пароль',
            example: 'newpassword123',
          },
        },
      },
      BlockRequest: {
        type: 'object',
        required: ['action'],
        properties: {
          action: {
            type: 'string',
            enum: ['block', 'unblock'],
            description:
              'Действие: block - заблокировать, unblock - разблокировать',
            example: 'block',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'Данные ответа',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Field is required', 'Invalid format'],
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Уникальный идентификатор задачи',
          },
          title: {
            type: 'string',
            description: 'Заголовок задачи',
            example: 'Сделать домашнее задание',
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Описание задачи',
            example: 'Подготовить отчёт по проекту',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Статус задачи',
            example: 'pending',
          },
          dueDate: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Дата выполнения (YYYY-MM-DD)',
            example: '2025-12-31',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description:
              'ID пользователя, которому принадлежит задача (null – общая задача)',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Дата последнего обновления',
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Заголовок задачи',
            example: 'Сделать домашнее задание',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 2000,
            description: 'Описание задачи',
            example: 'Подготовить отчёт по проекту',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Статус задачи (по умолчанию pending)',
            example: 'pending',
          },
          dueDate: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Дата выполнения (YYYY-MM-DD)',
            example: '2025-12-31',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description:
              'ID пользователя, которому будет принадлежать задача (только для админа или самому себе)',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Заголовок задачи',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 2000,
            description: 'Описание задачи',
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Статус задачи',
          },
          dueDate: {
            type: 'string',
            format: 'date',
            nullable: true,
            description: 'Дата выполнения',
          },
          userId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'ID пользователя (только для админа)',
          },
        },
      },
      BulkStatusUpdateRequest: {
        type: 'object',
        required: ['taskIds', 'status'],
        properties: {
          taskIds: {
            type: 'array',
            minItems: 1,
            maxItems: 100,
            items: { type: 'string', format: 'uuid' },
            description: 'Массив ID задач для массового обновления',
            example: [
              '123e4567-e89b-12d3-a456-426614174000',
              '987fcdeb-51a2-43d7-9b56-2546a3b1c2d3',
            ],
          },
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed'],
            description: 'Новый статус для всех указанных задач',
            example: 'completed',
          },
        },
      },
      PaginatedTasksResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNextPage: { type: 'boolean' },
              hasPreviousPage: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация нового пользователя',
        description:
          'Создает нового пользователя с ролью "user" и активным статусом',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Пользователь успешно зарегистрирован',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          description: 'JWT токен',
                        },
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Пользователь с таким email уже существует',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Авторизация пользователя',
        description: 'Аутентифицирует пользователя и возвращает JWT токен',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Успешная авторизация',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          description: 'JWT токен',
                        },
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Не указан email или пароль',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Неверный email или пароль',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Аккаунт заблокирован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Выход из системы',
        description: 'Деавторизация пользователя',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Успешный выход из системы',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Получение текущего пользователя',
        description:
          'Возвращает информацию о текущем авторизованном пользователе',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Информация о текущем пользователе',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Получение списка пользователей',
        description:
          'Возвращает список всех пользователей с пагинацией. Только для администраторов.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
            description: 'Номер страницы',
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10,
            },
            description: 'Количество записей на странице',
          },
          {
            name: 'role',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['admin', 'user'],
            },
            description: 'Фильтр по роли',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['active', 'blocked'],
            },
            description: 'Фильтр по статусу',
          },
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Поиск по имени',
          },
        ],
        responses: {
          '200': {
            description: 'Список пользователей',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/User',
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            hasNextPage: { type: 'boolean' },
                            hasPreviousPage: { type: 'boolean' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Доступ запрещен (требуются права администратора)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Получение пользователя по ID',
        description:
          'Возвращает информацию о пользователе. Доступно администратору или самому пользователю.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'ID пользователя',
          },
        ],
        responses: {
          '200': {
            description: 'Информация о пользователе',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Доступ запрещен',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Пользователь не найден',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Обновление пользователя',
        description:
          'Обновляет данные пользователя. Доступно администратору или самому пользователю.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'ID пользователя',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateUserRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Пользователь обновлен',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Доступ запрещен',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Пользователь не найден',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Email уже используется',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Удаление пользователя',
        description: 'Удаляет пользователя. Только для администраторов.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'ID пользователя',
          },
        ],
        responses: {
          '200': {
            description: 'Пользователь удален',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Доступ запрещен',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Пользователь не найден',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}/block': {
      patch: {
        tags: ['Users'],
        summary: 'Блокировка/разблокировка пользователя',
        description:
          'Блокирует или разблокирует пользователя. Доступно администратору или самому пользователю.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'ID пользователя',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BlockRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Статус пользователя изменен',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          $ref: '#/components/schemas/User',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Доступ запрещен',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Пользователь не найден',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Получение списка задач',
        description:
          'Возвращает список задач с фильтрацией и пагинацией. Администратор видит все задачи; обычный пользователь – свои и задачи без владельца.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Номер страницы',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, maximum: 100 },
            description: 'Количество задач на странице (макс. 100)',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
            },
            description: 'Фильтр по статусу задачи',
          },
          {
            name: 'dueDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description:
              'Фильтр по дате выполнения (точное совпадение, YYYY-MM-DD)',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description:
              'Поиск по заголовку или описанию (регистронезависимый)',
          },
        ],
        responses: {
          200: {
            description: 'Успешный ответ со списком задач',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      $ref: '#/components/schemas/PaginatedTasksResponse',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Создание новой задачи',
        description:
          'Создаёт задачу. Если пользователь авторизован, задача привязывается к нему (если не указан другой userId). Администратор может создать задачу для любого пользователя.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Задача успешно создана',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: { data: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
          400: {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description:
              'Доступ запрещён (попытка создать задачу для другого пользователя без прав)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Указанный userId не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: { description: 'Внутренняя ошибка сервера' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Получение задачи по ID',
        description:
          'Возвращает задачу, если пользователь имеет доступ (админ, владелец или общая задача).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID задачи',
          },
        ],
        responses: {
          200: {
            description: 'Задача найдена',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: { data: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
          400: { description: 'Неверный формат ID' },
          401: { description: 'Не авторизован' },
          403: { description: 'Нет доступа к этой задаче' },
          404: { description: 'Задача не найдена' },
          500: { description: 'Внутренняя ошибка' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Обновление задачи',
        description:
          'Обновляет поля задачи. Доступно владельцу задачи или администратору. Только администратор может изменить userId.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID задачи',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Задача обновлена',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: { data: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
          400: { description: 'Ошибка валидации или неверный формат ID' },
          401: { description: 'Не авторизован' },
          403: { description: 'Нет прав на редактирование этой задачи' },
          404: { description: 'Задача не найдена' },
          500: { description: 'Внутренняя ошибка' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Удаление задачи',
        description:
          'Удаляет задачу. Доступно владельцу задачи или администратору.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID задачи',
          },
        ],
        responses: {
          204: { description: 'Задача успешно удалена (нет содержимого)' },
          400: { description: 'Неверный формат ID' },
          401: { description: 'Не авторизован' },
          403: { description: 'Нет прав на удаление этой задачи' },
          404: { description: 'Задача не найдена' },
          500: { description: 'Внутренняя ошибка' },
        },
      },
    },
    '/tasks/status/bulk': {
      patch: {
        tags: ['Tasks'],
        summary: 'Массовое обновление статуса задач',
        description:
          'Обновляет статус для нескольких задач одновременно. Только для администраторов.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BulkStatusUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Статусы успешно обновлены',
            content: {
              'application/json': {
                schema: {
                  allOf: [{ $ref: '#/components/schemas/SuccessResponse' }],
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        updatedCount: {
                          type: 'integer',
                          description: 'Количество обновлённых задач',
                        },
                        status: { type: 'string', description: 'Новый статус' },
                        taskIds: {
                          type: 'array',
                          items: { type: 'string', format: 'uuid' },
                          description: 'Список ID обновлённых задач',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description:
              'Ошибка валидации (невалидный массив ID, неверный статус, задачи не найдены)',
          },
          401: { description: 'Не авторизован' },
          403: {
            description: 'Доступ запрещён (требуется роль администратора)',
          },
          500: { description: 'Внутренняя ошибка' },
        },
      },
    },
  },
};
const options = {
  swaggerDefinition,
  apis: ['../entities/server/routes/*.ts', '../entities/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
