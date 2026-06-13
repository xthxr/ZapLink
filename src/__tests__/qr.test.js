process.env.VERCEL = 'true';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key-that-is-long-enough-for-validation-32x';
process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough-32chars';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  firestore: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn() })) })),
  auth: jest.fn(() => ({ verifyIdToken: jest.fn() })),
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

describe('Analytics API', () => {
  it('GET /api/analytics/:shortCode returns 401 without auth', async () => {
    const res = await request(app).get('/api/analytics/testcode');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/user/analytics returns 401 without auth', async () => {
    const res = await request(app).get('/api/user/analytics');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/user/links returns 401 without auth', async () => {
    const res = await request(app).get('/api/user/links');
    expect(res.statusCode).toBe(401);
  });
});