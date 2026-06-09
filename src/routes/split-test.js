const express = require('express');
const router = express.Router();
const { getDatabase, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { toFirestoreId } = require('../utils/url.utils');

// ============ CONFIGURE split test for a link ============
router.post('/api/links/:shortCode/split-test', verifyToken, async (req, res) => {
  let { shortCode } = req.params;
  shortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;
  const { variants } = req.body;

  if (!variants || !Array.isArray(variants) || variants.length < 2) {
    return res.status(400).json({ error: 'At least 2 variants are required for a split test' });
  }

  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const firestoreId = toFirestoreId(shortCode);
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = linkDoc.data();
    if (linkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this link' });
    }

    await linkRef.update({
      splitTest: { variants: variants.map(v => ({ url: v.url, weight: v.weight || 50, name: v.name || '' })) }
    });

    res.json({ success: true, message: 'Split test configured successfully' });
  } catch (error) {
    console.error('Error configuring split test:', error);
    res.status(500).json({ error: 'Failed to configure split test' });
  }
});

// ============ REMOVE split test from a link ============
router.delete('/api/links/:shortCode/split-test', verifyToken, async (req, res) => {
  let { shortCode } = req.params;
  shortCode = decodeURIComponent(shortCode);
  const userId = req.user.uid;

  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const firestoreId = toFirestoreId(shortCode);
    const linkRef = db.collection(COLLECTIONS.LINKS).doc(firestoreId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = linkDoc.data();
    if (linkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this link' });
    }

    await linkRef.update({ splitTest: admin.firestore.FieldValue.delete() });
    res.json({ success: true, message: 'Split test removed successfully' });
  } catch (error) {
    console.error('Error removing split test:', error);
    res.status(500).json({ error: 'Failed to remove split test' });
  }
});

module.exports = router;
