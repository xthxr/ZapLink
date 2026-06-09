const express = require('express');
const router = express.Router();
const { getDatabase, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { toFirestoreId } = require('../utils/url.utils');

// ============ GET / create user profile ============
router.get('/api/user/profile', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (userDoc.exists) {
      return res.json({ profile: userDoc.data() });
    }

    const newProfile = {
      userId,
      email: req.user.email,
      username: null,
      usernameChangedAt: null,
      canChangeUsername: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection(COLLECTIONS.USERS).doc(userId).set(newProfile, { merge: true });
    const createdDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    res.json({ profile: createdDoc.exists ? createdDoc.data() : newProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ============ SET / UPDATE username ============
router.post('/api/user/username', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { username } = req.body;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
  }

  try {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userDoc.data();

    if (userData && userData.username && !userData.canChangeUsername) {
      return res.status(403).json({ error: 'Username can only be changed once' });
    }

    const usersSnapshot = await db.collection(COLLECTIONS.USERS)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const existingUser = usersSnapshot.docs[0];
      if (existingUser.id !== userId) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    const updateData = {
      username,
      usernameChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      canChangeUsername: userData && userData.username ? false : true
    };

    await db.collection(COLLECTIONS.USERS).doc(userId).update(updateData);

    res.json({ success: true, username, canChangeUsername: updateData.canChangeUsername });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

// ============ Check username availability ============
router.get('/api/check-username/:username', verifyToken, async (req, res) => {
  const { username } = req.params;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  if (username.length < 3 || username.length > 20) {
    return res.json({ available: false, error: 'Username must be 3-20 characters' });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.json({ available: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' });
  }

  try {
    const usersSnapshot = await db.collection(COLLECTIONS.USERS)
      .where('username', '==', username)
      .limit(1)
      .get();

    res.json({ available: usersSnapshot.empty });
  } catch (error) {
    console.error('Error checking username:', error);
    res.json({ available: false, error: 'Error checking username' });
  }
});

// ============ Check shortcode availability ============
router.get('/api/check-shortcode/:shortCode', verifyToken, async (req, res) => {
  const { shortCode } = req.params;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const firestoreId = toFirestoreId(shortCode);
    const doc = await db.collection(COLLECTIONS.LINKS).doc(firestoreId).get();
    res.json({ available: !doc.exists });
  } catch (error) {
    console.error('Error checking shortcode:', error);
    res.json({ available: true });
  }
});

module.exports = router;
