const express = require('express');
const router = express.Router();
const { getDatabase, getFirebaseState, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateShortCode, parseUTMParams, addUTMParams, getBaseUrl, toFirestoreId, validateCustomShortCode } = require('../utils/url.utils');
const { getAggregatedAnalytics, normalizeRedirectLink } = require('../utils/analytics');
const redisUtils = require('../utils/redis.utils');
const redirectCache = require('../utils/redirect-cache.utils');
const checkLinkHealth = require('../utils/checkLinkHealth');
const memoryStore = require('../services/memory.service');

// ============ CREATE short link ============
router.post('/api/shorten', verifyToken, async (req, res) => {
  const { url, utmParams, customShortCode, username, notes, tags, expiresAt, maxClicks } = req.body;
  const userId = req.user.uid;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL structure and block dangerous schemes
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).json({ error: 'Only http and https URLs are allowed' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const blockedSchemes = ['javascript:', 'data:', 'vbscript:'];
  const urlLower = url.toLowerCase();
  for (const scheme of blockedSchemes) {
    if (urlLower.startsWith(scheme)) {
      return res.status(400).json({ error: 'Invalid URL: dangerous URL scheme blocked' });
    }
  }

  // Validate / generate short code
  let shortCode;
  if (customShortCode) {
    const validation = validateCustomShortCode(customShortCode);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (username) {
      shortCode = `${username}/${customShortCode.trim()}`;
    } else {
      shortCode = customShortCode.trim();
    }

    // Check availability
    const firestoreId = toFirestoreId(shortCode);
    const db = getDatabase();
    if (db) {
      try {
        const existingDoc = await db.collection(COLLECTIONS.LINKS).doc(firestoreId).get();
        if (existingDoc.exists) {
          return res.status(409).json({ error: 'This custom short code is already taken' });
        }
      } catch (error) {
        console.error('Error checking custom short code:', error);
      }
    }
    if (memoryStore.hasLink(shortCode)) {
      return res.status(409).json({ error: 'This custom short code is already taken' });
    }
  } else {
    const randomCode = generateShortCode();
    shortCode = username ? `${username}/${randomCode}` : randomCode;
  }

  // Add UTM parameters if provided
  let finalUrl = url;
  if (utmParams) {
    const urlWithUTM = addUTMParams(url, utmParams);
    if (urlWithUTM) finalUrl = urlWithUTM;
  }

  const healthData = await checkLinkHealth(finalUrl);
  const baseUrl = getBaseUrl(req);
  const shortUrl = `${baseUrl}/${shortCode}`;

  const linkData = {
    originalUrl: finalUrl,
    shortCode,
    shortUrl,
    userId,
    userEmail: req.user.email || '',
    notes: notes || '',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    utmParams: parseUTMParams(finalUrl) || utmParams || {},
    isCustom: !!customShortCode,
    isActive: true,
    expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
    maxClicks: maxClicks ? parseInt(maxClicks) : null,
    clickCount: 0,
    notifiedExpiry: false,
    isExpired: false
  };

  const analyticsData = {
    impressions: 0, clicks: 0, shares: 0,
    clickHistory: [], devices: {}, browsers: {},
    countries: {}, locations: {}, referrers: {}
  };

  const db = getDatabase();
  if (db) {
    try {
      const firestoreId = toFirestoreId(shortCode);
      console.log('Saving link to Firestore:', { shortCode, firestoreId, userId });
      await db.collection(COLLECTIONS.LINKS).doc(firestoreId).set(linkData);
      await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).set(analyticsData);
      await redisUtils.storeLinkInRedis(shortCode, {
        destination: finalUrl, userId, createdAt: Date.now(), title: linkData.title || '',
      });
      await redirectCache.set(shortCode, normalizeRedirectLink(linkData));

      const verifyDoc = await db.collection(COLLECTIONS.LINKS).doc(firestoreId).get();
      if (verifyDoc.exists) {
        console.log('✅ Verified link exists in Firestore');
      } else {
        console.error('❌ Link was not found after save!');
      }

      return res.json({ success: true, shortUrl, shortCode, originalUrl: finalUrl, isCustom: !!customShortCode });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  }

  // Fallback to in-memory
  await memoryStore.setLink(shortCode, linkData);
  await memoryStore.setAnalytics(shortCode, analyticsData);
  await redirectCache.set(shortCode, normalizeRedirectLink(linkData));

  res.json({ success: true, shortUrl, shortCode, originalUrl: finalUrl, isCustom: !!customShortCode });
});

// ============ GET user links ============
router.get('/api/user/links', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  console.log(`🔍 Fetching links for user: ${userId}`);

  const db = getDatabase();
  if (!db) {
    // In-memory fallback
    const userLinks = await memoryStore.getAllLinks(userId);
    return res.json({ links: userLinks });
  }

  try {
    let linksSnapshot;
    try {
      linksSnapshot = await db.collection(COLLECTIONS.LINKS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (orderError) {
      console.log('OrderBy failed, trying without ordering:', orderError.message);
      linksSnapshot = await db.collection(COLLECTIONS.LINKS)
        .where('userId', '==', userId)
        .get();
    }

    const userLinks = [];
    const now = admin.firestore.Timestamp.now();

    for (const doc of linksSnapshot.docs) {
      const linkData = doc.data();

      // Auto-delete inactive links whose scheduledDeletion date has passed
      const isInactive = linkData.isActive === false;
      const scheduled = linkData.scheduledDeletion;
      if (isInactive && scheduled && scheduled.toMillis() <= now.toMillis()) {
        await db.collection(COLLECTIONS.LINKS).doc(doc.id).delete().catch(() => {});
        await db.collection(COLLECTIONS.ANALYTICS).doc(doc.id).delete().catch(() => {});
        continue;
      }

      // Auto-deactivate on expiry
      const nowDate = new Date();
      const dateExpired = linkData.expiresAt && linkData.expiresAt.toDate && linkData.expiresAt.toDate() < nowDate;
      const clickExpired = linkData.maxClicks && (linkData.clickCount || 0) >= linkData.maxClicks;
      if ((dateExpired || clickExpired) && linkData.isActive !== false) {
        await db.collection(COLLECTIONS.LINKS).doc(doc.id).update({ isActive: false, isExpired: true }).catch(() => {});
        linkData.isActive = false;
      }

      const analyticsData = await getAggregatedAnalytics(doc.id);
      userLinks.push({ ...linkData, clicks: analyticsData.clicks || 0, analytics: analyticsData, id: doc.id });
    }

    // Sort by createdAt descending
    userLinks.sort((a, b) => {
      const dateA = a.createdAt?._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(0);
      const dateB = b.createdAt?._seconds ? new Date(b.createdAt._seconds * 1000) : new Date(0);
      return dateB - dateA;
    });

    console.log(`✅ Returning ${userLinks.length} links for user ${userId}`);
    res.json({ links: userLinks });
  } catch (error) {
    console.error('Error fetching user links:', error);
    res.status(500).json({ error: 'Failed to fetch links', details: error.message });
  }
});

// ============ DEACTIVATE link ============
router.put('/api/links/:shortCode/deactivate', verifyToken, async (req, res) => {
  let { shortCode } = req.params;
  shortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;

  try {
    const db = getDatabase();
    const firestoreId = toFirestoreId(shortCode);
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) return res.status(404).json({ error: 'Link not found' });
    const linkData = linkDoc.data();
    if (linkData.userId !== userId) return res.status(403).json({ error: 'You do not have permission to deactivate this link' });

    const deactivationDate = new Date();
    const permanentDeletionDate = new Date();
    permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 15);

    await linkRef.update({ isActive: false, deactivatedAt: deactivationDate, scheduledDeletion: permanentDeletionDate });
    await redisUtils.deleteLinkFromRedis(shortCode);
    await redirectCache.delete(shortCode);

    res.json({ success: true, message: 'Link deactivated. Will be permanently deleted in 15 days.' });
  } catch (error) {
    console.error('Error deactivating link:', error);
    res.status(500).json({ error: 'Failed to deactivate link' });
  }
});

// ============ REACTIVATE link ============
router.put('/api/links/:shortCode/reactivate', verifyToken, async (req, res) => {
  let { shortCode } = req.params;
  shortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;

  try {
    const db = getDatabase();
    const firestoreId = toFirestoreId(shortCode);
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) return res.status(404).json({ error: 'Link not found' });
    const linkData = linkDoc.data();
    if (linkData.userId !== userId) return res.status(403).json({ error: 'You do not have permission to reactivate this link' });

    await linkRef.update({ isActive: true, deactivatedAt: admin.firestore.FieldValue.delete(), scheduledDeletion: admin.firestore.FieldValue.delete() });
    await redisUtils.storeLinkInRedis(shortCode, { ...linkData, isActive: true });

    res.json({ success: true, message: 'Link reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating link:', error);
    res.status(500).json({ error: 'Failed to reactivate link' });
  }
});

// ============ DELETE all inactive links ============
router.delete('/api/links/inactive', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const db = getDatabase();
    const inactiveLinksQuery = await db.collection(COLLECTIONS.LINKS)
      .where('userId', '==', userId)
      .where('isActive', '==', false)
      .get();

    if (inactiveLinksQuery.empty) {
      return res.json({ success: true, message: 'No inactive links to delete', count: 0 });
    }

    const BATCH_LIMIT = 400;
    let count = 0;
    let currentBatch = db.batch();
    let batchOps = 0;

    for (const doc of inactiveLinksQuery.docs) {
      const data = doc.data();
      const shortCode = data.shortCode;
      if (!shortCode) continue;

      currentBatch.delete(doc.ref);
      batchOps++;

      const fId = toFirestoreId(shortCode);
      currentBatch.delete(db.collection(COLLECTIONS.ANALYTICS).doc(fId));
      batchOps++;

      await redisUtils.deleteLinkFromRedis(shortCode).catch(() => {});
      await redirectCache.delete(shortCode).catch(() => {});

      count++;

      if (batchOps >= BATCH_LIMIT) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchOps = 0;
      }
    }

    if (batchOps > 0) await currentBatch.commit();
    res.json({ success: true, message: `Successfully deleted ${count} inactive link${count > 1 ? 's' : ''}`, count });
  } catch (error) {
    console.error('Error deleting inactive links:', error);
    res.status(500).json({ error: 'Failed to delete inactive links' });
  }
});

// ============ DELETE single link ============
router.delete('/api/links/:shortCode', verifyToken, async (req, res) => {
  let { shortCode } = req.params;
  shortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;

  try {
    const db = getDatabase();
    const firestoreId = toFirestoreId(shortCode);
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) return res.status(404).json({ error: 'Link not found' });
    const linkData = linkDoc.data();
    if (linkData.userId !== userId) return res.status(403).json({ error: 'You do not have permission to delete this link' });

    await linkRef.delete();
    await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).delete();
    await redisUtils.deleteLinkFromRedis(shortCode);
    await redirectCache.delete(shortCode);

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link', details: error.message });
  }
});

module.exports = router;
