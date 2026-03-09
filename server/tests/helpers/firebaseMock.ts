/**
 * Helper to generate fake Firebase tokens for testing.
 * The base64-encoded JSON is decoded by the mock verifyIdToken in setup.ts.
 */
export function createTestToken(uid: string, email: string): string {
  return Buffer.from(JSON.stringify({ uid, email })).toString('base64');
}
