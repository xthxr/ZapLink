const { getFirebaseState } = require('../../config/firebase.config');

/**
 * Middleware to attach Firebase state to every request
 */
function attachFirebaseState(req, res, next) {
  const firebaseState = getFirebaseState();
  req.firebase = { ...firebaseState };
  res.setHeader('X-Firebase-Mode', firebaseState.mode);
  next();
}

module.exports = { attachFirebaseState };
