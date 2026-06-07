require('dotenv').config();

/**
 * Application-wide environment constants and validation
 */

const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || undefined,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || false,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || null,
  isServerless: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
};

module.exports = ENV;
