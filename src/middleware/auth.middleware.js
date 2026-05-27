const { getAuth } = require('../../config/firebase.config');
const rateLimit = require('express-rate-limit');

/**
 * Middleware to verify Firebase authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token missing'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    const auth = getAuth();

    // Verify token and check for revoked sessions
    const decodedToken = await auth.verifyIdToken(token, true);

    // Attach user data to request
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.code);

    switch (error.code) {
      case 'auth/id-token-expired':
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });

      case 'auth/id-token-revoked':
        return res.status(401).json({
          success: false,
          error: 'Token revoked'
        });

      case 'auth/argument-error':
        return res.status(401).json({
          success: false,
          error: 'Malformed token'
        });

      default:
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
    }
  }
}

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

/**
 * Strict rate limiter for sensitive endpoints
 * Limits each IP to 10 requests per 15 minutes
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

module.exports = { verifyToken, apiLimiter, strictLimiter };