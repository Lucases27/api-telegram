import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Knex from 'knex';

// Create testDb first (unstable_mockModule doesn't hoist, so order matters here)
const testDb = Knex({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});

// Mock firebase-admin - no hoisting with unstable_mockModule
jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    apps: [],
    auth: () => ({
      verifyIdToken: jest.fn(async (token: string) => {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        return { uid: payload.uid, email: payload.email };
      }),
    }),
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
  },
}));

// Override the db module to use testDb (defined above, no hoisting issue)
jest.unstable_mockModule('../../src/db.ts', () => ({
  default: testDb,
}));

function createTestToken(uid: string, email: string): string {
  return Buffer.from(JSON.stringify({ uid, email })).toString('base64');
}

// Dynamic imports AFTER mocks are registered
import request from 'supertest';
import express from 'express';

const { registerUser, getMe } = await import('../../api/controllers/auth.controller.ts');
const { authMiddleware } = await import('../../src/middleware/auth.middleware.ts');

const app = express();
app.use(express.json());
app.post('/api/auth/register', registerUser);
app.get('/api/auth/me', authMiddleware, getMe);

beforeAll(async () => {
  await testDb.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('firebaseUid').notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.string('role').notNullable().defaultTo('customer');
    t.timestamp('createdAt').defaultTo(testDb.fn.now());
  });
});

afterAll(async () => {
  await testDb.destroy();
});

describe('POST /api/auth/register – Integration Tests', () => {
  it('1. Crea un usuario con token válido y devuelve 201', async () => {
    const token = createTestToken('uid-new-user', 'nuevo@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo Usuario' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('nuevo@test.com');
    expect(res.body.role).toBe('customer');
  });

  it('2. Devuelve 409 si el firebaseUid ya existe', async () => {
    const token = createTestToken('uid-new-user', 'nuevo@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo de Nuevo' });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('ya está registrado');
  });

  it('3. Devuelve 400 si falta el nombre en el body', async () => {
    const token = createTestToken('uid-sin-nombre', 'sinnombre@test.com');
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('name');
  });

  it('4. Devuelve 401 si no hay token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sin Token' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me – Integration Tests', () => {
  it('5. Devuelve los datos del usuario autenticado (200)', async () => {
    const token = createTestToken('uid-new-user', 'nuevo@test.com');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('nuevo@test.com');
    expect(res.body.role).toBe('customer');
  });

  it('6. Devuelve 401 si el usuario no existe en la DB (no completó el registro)', async () => {
    const token = createTestToken('uid-no-registrado', 'noregistrado@test.com');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Usuario no registrado');
  });
});
