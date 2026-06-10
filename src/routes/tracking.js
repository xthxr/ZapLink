const express = require('express');
const path = require('path');
const { getDatabase, COLLECTIONS, admin } = require('../../config/firebase.config');
const { toFirestoreId } = require('../utils/url.utils');
const { getDeviceType, getBrowserType, getReferrerSource } = require('../utils/analytics');
const redirectCache = require('../utils/redirect-cache.utils');

/**
 * Factory that accepts { io } and returns tracking + redirect router.
 * Redirect/bio-page routes MUST be registered LAST in server.js
 * to avoid capturing /api/* and static page paths.
 */
function createTrackingRouter({ io } = {}) {
  const router = express.Router();

  // ============ TRACK IMPRESSION (POST) ============
  router.post('/api/track/impression/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    if (!shortCode) return res.status(400).json({ error: 'shortCode is required' });

    const db = getDatabase();
    if (!db) {
      return res.json({ success: true, note: 'Firestore unavailable, impression logged in-memory' });
    }

    try {
      const firestoreId = toFirestoreId(shortCode);
      await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).update({
        impressions: admin.firestore.FieldValue.increment(1),
        clickHistory: admin.firestore.FieldValue.arrayUnion({
          type: 'impression',
          timestamp: new Date()
        })
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error recording impression:', error);
      res.status(500).json({ error: 'Failed to record impression' });
    }
  });

  // ============ TRACK SHARE (POST) ============
  router.post('/api/track/share/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    if (!shortCode) return res.status(400).json({ error: 'shortCode is required' });

    const db = getDatabase();
    if (!db) {
      return res.json({ success: true, note: 'Firestore unavailable, share logged in-memory' });
    }

    try {
      const firestoreId = toFirestoreId(shortCode);
      await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).update({
        shares: admin.firestore.FieldValue.increment(1)
      });

      if (io) {
        io.emit('analytics-update', { shortCode, type: 'share', timestamp: new Date() });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error recording share:', error);
      res.status(500).json({ error: 'Failed to record share' });
    }
  });

  // ============ TRACK IMPRESSION via HEAD (link previews) ============
  router.head('/:shortCode', async (req, res) => {
    const shortCode = decodeURIComponent(req.params.shortCode);
    if (!shortCode || shortCode.includes('/')) {
      return res.status(200).end();
    }

    try {
      const db = getDatabase();
      const firestoreId = toFirestoreId(shortCode);

      if (db) {
        const doc = await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).get();
        if (doc.exists) {
          // Use distributed counter shards
          const NUM_SHARDS = 10;
          const shardId = Math.floor(Math.random() * NUM_SHARDS).toString();
          await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId)
            .collection('shards').doc(shardId)
            .set({ impressions: admin.firestore.FieldValue.increment(1) }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error tracking HEAD impression:', error);
    }

    res.status(200).end();
  });

  // ============ REDIRECT: basic short link ============
  // GET /:shortCode — single-segment catch-all (register LAST)
  router.get('/:shortCode', async (req, res) => {
    const shortCode = decodeURIComponent(req.params.shortCode);
    if (!shortCode || shortCode.includes('/')) {
      return res.status(404).send('Not found');
    }

    try {
      const destination = await resolveRedirect(shortCode);
      if (destination) {
        return performRedirect(req, res, shortCode, destination);
      }

      res.status(404).send('Link not found');
    } catch (error) {
      console.error('Redirect error:', error);
      res.status(500).send('Internal server error');
    }
  });

  // ============ BIO PAGE or USERNAME-SCOPED REDIRECT ============
  // GET /:username/:slug — two-segment: check bio first, then try redirect
  router.get('/:username/:slug', async (req, res) => {
    const { username, slug } = req.params;
    const combined = `${username}/${slug}`;
    const db = getDatabase();

    try {
      // 1. Check if this is a bio page
      if (db) {
        const bioSnapshot = await db.collection(COLLECTIONS.BIO_LINKS || 'bioLinks')
          .where('slug', '==', slug)
          .limit(1)
          .get();

        if (!bioSnapshot.empty) {
          const bioDoc = bioSnapshot.docs[0];
          const bioData = bioDoc.data();

          // Verify the bio belongs to the user with this username
          const userSnapshot = await db.collection(COLLECTIONS.USERS)
            .where('username', '==', username)
            .limit(1)
            .get();

          if (!userSnapshot.empty && userSnapshot.docs[0].id === bioData.userId) {
            return res.sendFile(path.join(__dirname, '..', '..', 'public', 'bio.html'));
          }
        }
      }

      // 2. Not a bio page — try redirect
      const destination = await resolveRedirect(combined);
      if (destination) {
        return performRedirect(req, res, combined, destination);
      }

      res.status(404).send('Not found');
    } catch (error) {
      console.error('Two-segment route error:', error);
      res.status(500).send('Internal server error');
    }
  });

  return router;
}

// ============ HELPERS ============

/**
 * Resolve a shortCode/combined code to a destination URL.
 * Checks: cache → Firestore → in-memory
 */
async function resolveRedirect(code) {
  // Try cache first
  const cached = await redirectCache.get(code);
  if (cached && cached.destination) {
    return cached.destination;
  }

  const db = getDatabase();
  const firestoreId = toFirestoreId(code);

  // Try Firestore
  if (db) {
    try {
      const linkDoc = await db.collection(COLLECTIONS.LINKS).doc(firestoreId).get();
      if (linkDoc.exists) {
        const linkData = linkDoc.data();
        if (linkData.isActive === false) return null;

        await redirectCache.set(code, {
          destination: linkData.originalUrl,
          title: linkData.title || ''
        });
        return linkData.originalUrl;
      }
    } catch (err) {
      console.error('Firestore redirect lookup failed:', err.message);
    }
  }

  // Try in-memory
  const memoryStore = require('../services/memory.service');
  const link = await memoryStore.getLink(code);
  if (link && link.isActive !== false) {
    return link.originalUrl;
  }

  return null;
}

/**
 * Perform a 302 redirect and fire-and-forget analytics recording
 */
async function performRedirect(req, res, shortCode, destination) {
  recordClickAsync(req, shortCode).catch(err => {
    console.error('Async click analytics error:', err.message);
  });

  try {
    res.redirect(302, destination);
  } catch (err) {
    console.error('Redirect failed:', err.message);
    res.status(500).send('Redirect failed');
  }
}

/**
 * Fire-and-forget click analytics recording
 */
async function recordClickAsync(req, shortCode) {
  const db = getDatabase();
  if (!db) return;

  const userAgent = req.headers['user-agent'] || '';
  const deviceType = getDeviceType(userAgent);
  const browserType = getBrowserType(userAgent);
  const referrerSource = getReferrerSource(req.headers.referer || '');
  const firestoreId = toFirestoreId(shortCode);
  const now = new Date();
  const dayKey = now.toISOString().split('T')[0];

  try {
    await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).set({
      clicks: admin.firestore.FieldValue.increment(1),
      [`devices.${deviceType}`]: admin.firestore.FieldValue.increment(1),
      [`browsers.${browserType.replace(/[.#$/[\]]/g, '_')}`]: admin.firestore.FieldValue.increment(1),
      [`referrers.${referrerSource.replace(/[.#$/[\]]/g, '_')}`]: admin.firestore.FieldValue.increment(1),
      [`dailyClicks.${dayKey}`]: admin.firestore.FieldValue.increment(1),
      clickHistory: admin.firestore.FieldValue.arrayUnion({
        type: 'click',
        timestamp: now,
        device: deviceType,
        browser: browserType,
        referrer: referrerSource,
        ip: req.ip
      })
    }, { merge: true });
  } catch (err) {
    console.error('Async analytics update failed:', err.message);
  }
}

module.exports = { createTrackingRouter };
