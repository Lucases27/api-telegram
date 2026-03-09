import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// In ESM with Jest, use unstable_mockModule which doesn't get hoisted
// This allows us to use variables from the module scope in the mock factory

// ---- Firebase Admin mock ----
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

// ---- Mock db ----
const mockUser = { id: 1, firebaseUid: 'uid-test', email: 'test@test.com', name: 'Test', role: 'customer' };

// Hold the mock fn reference so we can reconfigure per-test
const firstFn = jest.fn<() => Promise<any>>();
const mockQuery = {
  where: jest.fn().mockReturnThis(),
  first: firstFn,
  select: jest.fn().mockReturnThis(),
};
const mockDb = jest.fn(() => mockQuery) as jest.MockedFunction<any>;

jest.unstable_mockModule('../../src/db.ts', () => ({
  default: mockDb,
}));

// Dynamic imports AFTER mocks are registered
const { authMiddleware } = await import('../../src/middleware/auth.middleware.ts');

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

describe('authMiddleware – Unit Tests', () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    mockDb.mockClear();
    firstFn.mockReset();
    mockQuery.where.mockClear();
    // Restore default chain so mockDb() still returns mockQuery for where/first
    mockDb.mockImplementation(() => mockQuery);
    mockQuery.where.mockReturnThis();
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
    firstFn.mockResolvedValue(undefined as any);
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect((res as any).json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Usuario no registrado') })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('5. Calls next() and attaches req.user when token is valid and user exists in DB', async () => {
    firstFn.mockResolvedValue(mockUser as any);
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toMatchObject({ id: 1, role: 'customer' });
  });

  it('6. Attaches the full user object from DB to req.user', async () => {
    const adminUser = { ...mockUser, role: 'admin', id: 99 };
    firstFn.mockResolvedValue(adminUser as any);
    const req = makeRequest(validToken);
    const res = makeResponse();
    await authMiddleware(req as Request, res as Response, next as NextFunction);
    expect((req as any).user?.role).toBe('admin');
    expect((req as any).user?.id).toBe(99);
  });
});
