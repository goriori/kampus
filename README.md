# kampus

## Инструкция по установке и использованию API приложения (Node.js + Express + Sequelize + JWT)

Данное приложение представляет собой REST API для управления пользователями и задачами.

Аутентификация — JWT, база данных — PostgreSQL, ORM — Sequelize.

**Вся актуальная информация о запросах, параметрах, телах и ответах доступна через встроенную Swagger-документацию (/api/docs).**

## 1. Требования

- **Node.js** (версия 18+) или **Bun** (рекомендуется)
- **PostgreSQL** (версия 12+)
- **npm** / **bun** / **yarn**

## 2. Установка и настройка

```bash

git clone https://github.com/goriori/kampus.git

cd kampus

bun install # или npm install

cp .env.example .env
```

Отредактируйте .env:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://логин:пароль@localhost:5432/имя_бд
JWT_SECRET=сложный_секретный_ключ
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

Создайте базу данных PostgreSQL, если она ещё не создана.
При первом запуске таблицы создадутся автоматически (через Sequelize.sync).

## 3. Запуск

Режим разработки (с автоперезагрузкой):

```bash
bun run dev
```

Сборка и запуск в production:

```bash
bun run build
bun run start:bun      # через Bun
# или
bun run start:node     # через Node.js
```

После запуска сервер будет доступен по адресу: http://localhost:5000.

## 4. Документация API (Swagger)

Перейдите в браузере по адресу:

http://localhost:5000/api/docs

Там находится интерактивная документация (Swagger UI), построенная на основе OpenAPI 3.0.0.

В ней вы можете:

- Просмотреть все эндпоинты, их параметры, схемы запросов и ответов.
- Авторизоваться (кнопка Authorize) – вставьте полученный JWT токен в формате Bearer token
- Выполнять любые запросы прямо из документации, подставляя нужные значения.
- Фильтровать эндпоинты по тегам: Auth, Users, Tasks.

### 5. Аутентификация и JWT

Большинство эндпоинтов требуют передачи JWT токена в заголовке:

```bash
# Регистрация
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","birthDate":"1990-01-01","email":"test@example.com","password":"123456"}'

# Логин (сохраните token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

TOKEN="ваш_токен"

# Создание задачи
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Купить молоко","status":"pending"}'

# Получение списка задач (с фильтром по статусу)
curl -X GET "http://localhost:5000/api/tasks?status=pending&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Массовое обновление статуса (только админ)
curl -X PATCH http://localhost:5000/api/tasks/status/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskIds":["uuid-1","uuid-2"],"status":"completed"}'
```

## 6. Коды ответов (общие)

- `200` – Успешный GET, PUT, PATCH
- `201` – Успешное создание (POST)
- `204` – Успешное удаление (без тела)
- `400` – Ошибка валидации или неверный запрос
- `401` – Отсутствует или недействительный JWT
- `403` – Недостаточно прав (требуется администратор или владелец)
- `404` – Ресурс не найден
- `409` – Конфликт (например, email уже существует)
- `500` – Внутренняя ошибка сервера
