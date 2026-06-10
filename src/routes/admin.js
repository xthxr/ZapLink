const express = require('express');
const router = express.Router();
const { getDatabase, getFirebaseState, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const redisUtils = require('../utils/redis.utils');
const redirectCache = require('../utils/redirect-cache.utils');

// ============ GET system status ============
router.get('/api/system/status', async (req, res) => {
  const firebaseState = getFirebaseState();
  const db = getDatabase();

  const status = {
    server: 'running',
    timestamp: new Date().toISOString(),
    firebase: {
      enabled: firebaseState.enabled,
      mode: firebaseState.mode,
      message: firebaseState.message
    }
  };

  if (db) {
    try {
      await db.collection(COLLECTIONS.LINKS).limit(1).get();
      status.firestore = 'connected';
    } catch (error) {
      status.firestore = 'error';
      status.firestoreError = error.message;
    }
  } else {
    status.firestore = 'not available';
  }

  res.json(status);
});

// ============ SYNC links to Redis ============
router.post('/api/admin/sync-redis', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  // Check if user is admin
  if (userId !== process.env.ADMIN_UID) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = getDatabase();
  if (!db) {
    return res.status(503).json({ error: 'Firestore not available' });
  }

  try {
    const linksSnapshot = await db.collection(COLLECTIONS.LINKS).get();
    let synced = 0;
    let errors = 0;

    for (const doc of linksSnapshot.docs) {
      const linkData = doc.data();
      if (!linkData.shortCode) continue;

      try {
        await redisUtils.storeLinkInRedis(linkData.shortCode, {
          destination: linkData.originalUrl,
          userId: linkData.userId,
          createdAt: linkData.createdAt?.toMillis?.() || Date.now(),
          title: linkData.title || ''
        });
        await redirectCache.set(linkData.shortCode, {
          destination: linkData.originalUrl,
          title: linkData.title || ''
        });
        synced++;
      } catch (err) {
        console.error(`Failed to sync ${linkData.shortCode}:`, err.message);
        errors++;
      }
    }

    res.json({ success: true, synced, errors, message: `Synced ${synced} links to Redis (${errors} errors)` });
  } catch (error) {
    console.error('Error syncing to Redis:', error);
    res.status(500).json({ error: 'Failed to sync to Redis' });
  }
});

// ============ DELETE user account ============
router.delete('/api/user/account', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const db = getDatabase();

  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    // Delete all user's links
    const linksSnapshot = await db.collection(COLLECTIONS.LINKS)
      .where('userId', '==', userId)
      .get();

    const BATCH_LIMIT = 400;
    let currentBatch = db.batch();
    let batchOps = 0;

    for (const doc of linksSnapshot.docs) {
      currentBatch.delete(doc.ref);
      batchOps++;

      const linkData = doc.data();
      if (linkData.shortCode) {
        const firestoreId = require('../utils/url.utils').toFirestoreId(linkData.shortCode);
        currentBatch.delete(db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId));
        batchOps++;
      }

      if (batchOps >= BATCH_LIMIT) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchOps = 0;
      }
    }

    if (batchOps > 0) await currentBatch.commit();

    // Delete bio links
    const bioSnapshot = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('userId', '==', userId)
      .get();

    currentBatch = db.batch();
    batchOps = 0;
    for (const doc of bioSnapshot.docs) {
      currentBatch.delete(doc.ref);
      batchOps++;
      if (batchOps >= BATCH_LIMIT) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchOps = 0;
      }
    }
    if (batchOps > 0) await currentBatch.commit();

    // Delete user document
    await db.collection(COLLECTIONS.USERS).doc(userId).delete();

    res.json({ success: true, message: 'Account and all associated data deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
