process.env.VERCEL = 'true';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key-that-is-long-enough-for-validation-32x';
process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough-32chars';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  firestore: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn() })) })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
  })),
}));
jest.mock('@upstash/redis', () => ({ Redis: jest.fn(() => ({ get: jest.fn(), set: jest.fn(), del: jest.fn() })) }));
jest.mock('../utils/checkLinkHealth', () => jest.fn());
jest.mock('../utils/redis.utils', () => ({ getCachedLink: jest.fn(), setCachedLink: jest.fn() }));
jest.mock('../utils/redirect-cache.utils', () => ({ get: jest.fn(), set: jest.fn() }));
jest.mock('../services/splitTest.service', () => ({ getSplitTest: jest.fn(), recordClick: jest.fn() }));
jest.mock('../middleware/security.middleware', () => ({
  securityHeaders: (req, res, next) => next(),
  apiLimiter: (req, res, next) => next(),
  bugReportLimiter: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../../server');

describe('URL Shortening API', () => {
  it('POST /api/shorten returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/shorten returns 401 with invalid token', async () => {
    const res = await request(app)
      .post('/api/shorten')
      .set('Authorization', 'Bearer invalid-token')
      .send({ url: 'https://example.com' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/shorten without auth header returns 401', async () => {
    const res = await request(app).post('/api/shorten');
    expect(res.statusCode).toBe(401);
  });
});