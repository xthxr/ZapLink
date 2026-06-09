const { getAuth, getDatabase, getFirebaseState, COLLECTIONS } = require('../../config/firebase.config');
const { toFirestoreId } = require('../utils/url.utils');

/**
 * Middleware to verify Firebase authentication token
 */
async function verifyToken(req, res, next) {
  const firebaseState = getFirebaseState();

  // If Firebase Auth is not available, reject with clear message
  if (!firebaseState.enabled) {
    return res.status(503).json({
      error: 'Authentication service unavailable. Please configure Firebase.'
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token missing' });
  }

  const token = authHeader.substring(7);

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token, true);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.code);

    switch (error.code) {
      case 'auth/id-token-expired':
        return res.status(401).json({ success: false, error: 'Token expired' });
      case 'auth/id-token-revoked':
        return res.status(401).json({ success: false, error: 'Token revoked' });
      case 'auth/argument-error':
        return res.status(401).json({ success: false, error: 'Malformed token' });
      default:
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }
}

/**
 * Middleware to verify that the authenticated user owns a link
 * Must be used after verifyToken. Expects req.params.shortCode.
 */
async function requireLinkOwnership(req, res, next) {
  const { shortCode } = req.params;
  const decodedShortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;

  const firestoreId = toFirestoreId(decodedShortCode);

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = linkDoc.data();
    if (linkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this link' });
    }

    req.linkData = linkData;
    req.firestoreId = firestoreId;
    req.decodedShortCode = decodedShortCode;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ error: 'Failed to verify ownership' });
  }
}

/**
 * Middleware to verify that the authenticated user owns a bio link
 * Must be used after verifyToken. Expects req.params.id (bio link doc ID).
 */
async function requireBioOwnership(req, res, next) {
  const { id } = req.params;
  const userId = req.user.uid;

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const bioLinkRef = db.collection(COLLECTIONS.BIO_LINKS).doc(id);
    const bioLinkDoc = await bioLinkRef.get();

    if (!bioLinkDoc.exists) {
      return res.status(404).json({ error: 'Bio link not found' });
    }

    const bioLinkData = bioLinkDoc.data();
    if (bioLinkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this bio link' });
    }

    req.bioLinkData = bioLinkData;
    next();
  } catch (error) {
    console.error('Bio ownership check error:', error);
    return res.status(500).json({ error: 'Failed to verify ownership' });
  }
}

module.exports = { verifyToken, requireLinkOwnership, requireBioOwnership };
