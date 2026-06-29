# Storefront Backend API

A RESTful API for an online storefront built with Node.js, Express, TypeScript, and PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Ports

| Service    | Port |
|------------|------|
| API Server | 3000 |
| PostgreSQL | 5432 |

## Environment Setup

Create a `.env` file in the project root with the following variables:

```
POSTGRES_DB=full_stack_dev
POSTGRES_USER=full_stack_user
POSTGRES_PASSWORD=password123
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
BCRYPT_PASSWORD=your-bcrypt-secret
SALT_ROUNDS=10
TOKEN_SECRET=your-jwt-secret
```

## Package Installation

```bash
npm install
```

## Database Setup

### 1. Start the PostgreSQL container

Ensure Docker Desktop is running, then:

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port `5432` using the credentials from your `.env` file.

### 2. Verify the database connection

```bash
docker compose exec postgres psql -U full_stack_user -d full_stack_dev
```

Once inside psql, run `\dt` to list tables. Type `\q` to exit.

### 3. Run database migrations

```bash
npx db-migrate up
```

This creates all required tables: `users`, `products`, `orders`, `order_products`.

### 4. Seed an admin user

Generate a bcrypt hash for your chosen password (replace values to match your `.env`):

```bash
node -e "const b=require('bcrypt'); console.log(b.hashSync('your-password' + 'your-bcrypt-secret', 10))"
```

Then insert the admin user via psql:

```bash
docker compose exec postgres psql -U full_stack_user -d full_stack_dev
```

```sql
INSERT INTO users (first_name, last_name, password) VALUES ('Admin', 'User', '<paste_hash_here>');
```

## Running Tests

### 1. Create the test database (one-time setup)

The PostgreSQL container must be running (`docker compose up -d`). Then run:

```bash
docker exec $(docker ps -qf "ancestor=postgres:16") psql -U full_stack_user -d full_stack_dev -c "
  CREATE USER test_user WITH PASSWORD 'password123';
  CREATE DATABASE \"full_stack_dev-test\";
  GRANT ALL PRIVILEGES ON DATABASE \"full_stack_dev-test\" TO test_user;
"
```

Then grant schema permissions:

```bash
docker exec $(docker ps -qf "ancestor=postgres:16") psql -U full_stack_user -d "full_stack_dev-test" -c "GRANT ALL ON SCHEMA public TO test_user;"
```

> This only needs to be done once. The test database persists across runs.

### 2. Run the test suite

```bash
npm test
```

This will:
- Run all pending migrations on the test database
- Execute all 45 Jasmine specs (handler tests + model tests)
- Each spec runs inside a database transaction that is rolled back automatically — no manual cleanup needed and no leftover data between runs

### Test structure

| Directory | What it tests |
|-----------|--------------|
| `src/tests/` | HTTP handler tests (mocked DB, uses supertest) |
| `src/models/tests/` | Model/store tests (hits the real test DB) |

## Running the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`.

## Available Scripts

| Script             | Description                       |
|--------------------|-----------------------------------|
| `npm start`        | Start the server with ts-node     |
| `npm run watch`    | Start with auto-reload on changes |
| `npm run lint`     | Run ESLint on TypeScript files    |
| `npm run prettier` | Format TypeScript files           |
| `npm test`         | Run Jasmine tests                 |

## Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Getting a token

Send a POST request to `/api/login`:

```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "first_name": "Admin",
  "last_name": "User",
  "password": "your-password"
}
```

Use the returned `token` value in the `Authorization` header for all protected requests.

## API Routes

See [REQUIREMENTS.md](./REQUIREMENTS.md) for full API documentation including request/response shapes.
