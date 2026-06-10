/**
 * Standardized response helpers for consistent API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} [data={}] - Response data
 * @param {number} [status=200] - HTTP status code
 */
function sendSuccess(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [status=500] - HTTP status code
 * @param {Object} [details=null] - Additional error details
 */
function sendError(res, message, status = 500, details = null) {
  const body = { error: message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

/**
 * Send a 403 Forbidden response
 * @param {Object} res - Express response object
 * @param {string} [message='Forbidden']
 */
function sendForbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: message });
}

/**
 * Send a 404 Not Found response
 * @param {Object} res - Express response object
 * @param {string} [message='Not found']
 */
function sendNotFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

module.exports = { sendSuccess, sendError, sendForbidden, sendNotFound };
