import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Knex from 'knex';

// Create testDb before any mocks (unstable_mockModule doesn't hoist, so order matters)
const testDb = Knex({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});

// Mock firebase-admin (not hoisted, runs in order)
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

// Mock db, testDb is already defined above
jest.unstable_mockModule('../../src/db.ts', () => ({
  default: testDb,
}));

// Dynamic imports AFTER mocks are registered
import request from 'supertest';
import express from 'express';

const { getReservations, createReservation, deleteReservation } = await import('../../api/controllers/reservation.controller.ts');
const { authMiddleware } = await import('../../src/middleware/auth.middleware.ts');

function createTestToken(uid: string, email: string): string {
  return Buffer.from(JSON.stringify({ uid, email })).toString('base64');
}

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.get('/api/reservations', getReservations);
app.post('/api/reservations', createReservation);
app.delete('/api/reservations/:id', deleteReservation);

const customerToken = createTestToken('uid-customer', 'customer@test.com');
const adminToken = createTestToken('uid-admin', 'admin@test.com');

beforeAll(async () => {
  await testDb.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('firebaseUid').notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('name').notNullable();
    t.string('role').notNullable().defaultTo('customer');
    t.timestamp('createdAt').defaultTo(testDb.fn.now());
  });
  await testDb.schema.createTable('restaurants', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
  });
  await testDb.schema.createTable('reservations', (t) => {
    t.increments('id').primary();
    t.integer('restaurantId').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
    t.integer('userId').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
    t.string('name').notNullable();
    t.date('date').notNullable();
    t.timestamp('createdAt').defaultTo(testDb.fn.now());
  });

  // Seed
  await testDb('restaurants').insert({ id: 1, name: 'Restaurante A' });
  const [customerId] = await testDb('users').insert({ firebaseUid: 'uid-customer', email: 'customer@test.com', name: 'Customer', role: 'customer' });
  const [adminId] = await testDb('users').insert({ firebaseUid: 'uid-admin', email: 'admin@test.com', name: 'Admin', role: 'admin' });

  // Customer owns reservation 1, Admin owns reservation 2
  await testDb('reservations').insert({ restaurantId: 1, name: 'Customer Res', date: '2026-03-01', userId: customerId });
  await testDb('reservations').insert({ restaurantId: 1, name: 'Admin Res', date: '2026-03-02', userId: adminId });
});

afterAll(async () => {
  await testDb.destroy();
});

describe('GET /api/reservations – Role-based filtering', () => {
  it('1. Customer solo ve sus propias reservas', async () => {
    const res = await request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Customer Res');
  });

  it('2. Admin ve todas las reservas', async () => {
    const res = await request(app)
      .get('/api/reservations')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('DELETE /api/reservations/:id – Ownership enforcement', () => {
  it('3. Customer intenta eliminar reserva ajena → 403', async () => {
    // Reservation 2 belongs to admin
    const res = await request(app)
      .delete('/api/reservations/2')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('4. Customer puede eliminar su propia reserva → 200', async () => {
    const res = await request(app)
      .delete('/api/reservations/1')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('eliminada');
  });
});
