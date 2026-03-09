import { jest, describe, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middleware/role.middleware.ts';

function makeResponse(): Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authorize (roleMiddleware) – Unit Tests', () => {
  it('1. Returns 401 if req.user is not set', () => {
    const req = {} as Request;
    const res = makeResponse();
    const next = jest.fn();
    authorize('admin')(req, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Returns 403 if user role is customer but only admin is allowed', () => {
    const req = { user: { role: 'customer' } } as any;
    const res = makeResponse();
    const next = jest.fn();
    authorize('admin')(req, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('3. Returns 403 if user role is admin but only customer is allowed', () => {
    const req = { user: { role: 'admin' } } as any;
    const res = makeResponse();
    const next = jest.fn();
    authorize('customer')(req, res as Response, next as NextFunction);
    expect((res as any).status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('4. Calls next() if user role is in the allowed roles (admin)', () => {
    const req = { user: { role: 'admin' } } as any;
    const res = makeResponse();
    const next = jest.fn();
    authorize('admin', 'customer')(req, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
    expect((res as any).status).not.toHaveBeenCalled();
  });

  it('5. Calls next() if user role is in the allowed roles (customer)', () => {
    const req = { user: { role: 'customer' } } as any;
    const res = makeResponse();
    const next = jest.fn();
    authorize('admin', 'customer')(req, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('6. Returns 403 with descriptive error message', () => {
    const req = { user: { role: 'customer' } } as any;
    const res = makeResponse();
    const next = jest.fn();
    authorize('admin')(req, res as Response, next as NextFunction);
    expect((res as any).json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('permiso') })
    );
  });
});
