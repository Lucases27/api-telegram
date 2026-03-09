import { jest } from '@jest/globals';

// Mock firebase-admin globally for all tests
jest.mock('firebase-admin', () => ({
  apps: [],
  auth: () => ({
    verifyIdToken: jest.fn(async (token: string) => {
      // Decode our fake base64 tokens
      try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        return { uid: payload.uid, email: payload.email };
      } catch {
        throw new Error('Invalid token');
      }
    }),
  }),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

export {};
