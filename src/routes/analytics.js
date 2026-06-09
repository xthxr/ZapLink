const express = require('express');
const router = express.Router();
const { getDatabase, COLLECTIONS } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { toFirestoreId } = require('../utils/url.utils');
const { getAggregatedAnalytics } = require('../utils/analytics');

// ============ GET aggregated analytics for all user's links ============
router.get('/api/user/analytics', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const db = getDatabase();

  if (!db) {
    return res.status(503).json({ error: 'Firestore not available' });
  }

  try {
    const linksSnapshot = await db.collection(COLLECTIONS.LINKS)
      .where('userId', '==', userId)
      .get();

    const linksData = [];
    linksSnapshot.forEach(doc => {
      linksData.push({ id: doc.id, ...doc.data() });
    });

    const analyticsPromises = linksData.map(async (link) => {
      const firestoreId = toFirestoreId(link.shortCode);
      try {
        const analyticsDoc = await db.collection(COLLECTIONS.ANALYTICS).doc(firestoreId).get();
        return {
          shortCode: link.shortCode,
          linkData: link,
          analytics: analyticsDoc.exists ? analyticsDoc.data() : null
        };
      } catch (err) {
        return { shortCode: link.shortCode, linkData: link, analytics: null };
      }
    });

    const analyticsData = await Promise.all(analyticsPromises);
    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ GET analytics for a specific link ============
router.get('/api/analytics/:shortCode', verifyToken, async (req, res) => {
  const { shortCode } = req.params;
  const userId = req.user.uid;
  const db = getDatabase();

  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const firestoreId = toFirestoreId(shortCode);
    const linkDoc = await db.collection(COLLECTIONS.LINKS).doc(firestoreId).get();

    if (linkDoc.exists) {
      const linkData = linkDoc.data();
      if (linkData.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const aggregatedStats = await getAggregatedAnalytics(firestoreId);
      return res.json({ link: linkData, analytics: aggregatedStats });
    }
  } catch (error) {
    console.error('Error reading from Firestore:', error);
  }

  // Fallback to in-memory storage
  const memoryStore = require('../services/memory.service');
  const link = await memoryStore.getLink(shortCode);
  const stats = await memoryStore.getAnalytics(shortCode);

  if (!link || !stats) {
    return res.status(404).json({ error: 'Link not found' });
  }

  if (link.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ link, analytics: stats });
});

module.exports = router;
