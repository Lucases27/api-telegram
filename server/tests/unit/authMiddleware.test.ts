import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// ---- Firebase Admin mock must be set up before importing authMiddleware ----
jest.mock('firebase-admin', () => ({
  apps: [],
  auth: () => ({
    verifyIdToken: jest.fn(async (token: string) => {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      return { uid: payload.uid, email: payload.email };
    }),
  }),
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
}));

// ---- Mock db ----
const mockUser = { id: 1, firebaseUid: 'uid-test', email: 'test@test.com', name: 'Test', role: 'customer' };

jest.mock('../../src/db.ts', () => {
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    select: jest.fn().mockReturnThis(),
  };
  const db = jest.fn(() => mockQuery) as any;
  db.mockQuery = mockQuery;
  return { default: db };
});

import { authMiddleware } from '../../src/middleware/auth.middleware.ts';

function makeRequest(token?: string): Partial<Request> {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  } as Partial<Request>;
}

function makeResponse(): Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const validToken = Buffer.from(JSON.stringify({ uid: 'uid-test', email: 'test@test.com' })).toString('base64');

// Get the mock db module
const dbModule = await import('../../src/db.ts');
const mockDb = (dbModule as any).default;

describe('authMiddleware – Unit Tests', () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    mockDb.mockClear();
    mockDb.mockQuery?.where.mockClear();
    mockDb.mockQuery?.first.mockClear();
  });

  it('1. Returns 401 if no Authorization header is provided', async () => {
    const req = makeRequest();
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Returns 401 if Authorization header does not start with Bearer', async () => {
    const req = { headers: { authorization: 'Basic abc123' } } as any;
    const res = makeResponse();
    await authMiddleware(req, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('3. Returns 401 if token is invalid (non-base64 garbage)', async () => {
    const req = makeRequest('invalid_token_that_cannot_be_decoded');
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('4. Returns 401 if Firebase token is valid but user not found in DB', async () => {
    mockDb.mockReturnValue({ where: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(null) });
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Usuario no registrado') }));
    expect(next).not.toHaveBeenCalled();
  });

  it('5. Calls next() and attaches req.user when token is valid and user exists in DB', async () => {
    mockDb.mockReturnValue({ where: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(mockUser) });
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toMatchObject({ id: 1, role: 'customer' });
  });

  it('6. Attaches the full user object from DB to req.user', async () => {
    const adminUser = { ...mockUser, role: 'admin', id: 99 };
    mockDb.mockReturnValue({ where: jest.fn().mockReturnThis(), first: jest.fn().mockResolvedValue(adminUser) });
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((req as any).user.role).toBe('admin');
    expect((req as any).user.id).toBe(99);
  });
});
