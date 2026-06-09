const express = require('express');
const router = express.Router();
const { getDatabase, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');

// ============ Check bio slug availability ============
router.get('/api/bio-links/check-slug/:slug', verifyToken, async (req, res) => {
  const { slug } = req.params;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const existingSlug = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('slug', '==', slug)
      .get();
    res.json({ available: existingSlug.empty });
  } catch (error) {
    console.error('Error checking slug:', error);
    res.status(500).json({ error: 'Failed to check slug availability' });
  }
});

// ============ GET user's bio links ============
router.get('/api/bio-links', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const snapshot = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('userId', '==', userId)
      .get();

    const bioLinks = [];
    snapshot.forEach(doc => {
      bioLinks.push({ id: doc.id, ...doc.data() });
    });

    bioLinks.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    res.json({ success: true, bioLinks });
  } catch (error) {
    console.error('Error fetching bio links:', error);
    res.status(500).json({ error: 'Failed to fetch bio links' });
  }
});

// ============ CREATE bio link ============
router.post('/api/bio-links', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { name, slug, description, profilePicture, themeColor, backgroundStyle, links, social } = req.body;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }

  try {
    const existingSlug = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('slug', '==', slug)
      .get();

    if (!existingSlug.empty) {
      return res.status(409).json({ error: 'This URL slug is already taken' });
    }

    const userBioLinks = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('userId', '==', userId)
      .get();

    if (!userBioLinks.empty) {
      return res.status(409).json({ error: 'You can only create one bio link. Please edit your existing one.' });
    }

    const bioLinkData = {
      userId,
      name: name.trim(),
      slug,
      description: description || '',
      profilePicture: profilePicture || '',
      themeColor: themeColor || '#06b6d4',
      backgroundStyle: backgroundStyle || 'gradient',
      links: links || [],
      social: social || {},
      views: 0,
      clicks: 0,
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(COLLECTIONS.BIO_LINKS).add(bioLinkData);
    res.status(201).json({ success: true, id: docRef.id, message: 'Bio link created successfully' });
  } catch (error) {
    console.error('Error creating bio link:', error);
    res.status(500).json({ error: 'Failed to create bio link' });
  }
});

// ============ UPDATE bio link ============
router.put('/api/bio-links/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const { name, slug, description, profilePicture, themeColor, backgroundStyle, links, social } = req.body;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }

  try {
    const bioLinkRef = db.collection(COLLECTIONS.BIO_LINKS).doc(id);
    const bioLinkDoc = await bioLinkRef.get();

    if (!bioLinkDoc.exists) {
      return res.status(404).json({ error: 'Bio link not found' });
    }

    const bioLinkData = bioLinkDoc.data();
    if (bioLinkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this bio link' });
    }

    if (slug !== bioLinkData.slug) {
      const existingSlug = await db.collection(COLLECTIONS.BIO_LINKS)
        .where('slug', '==', slug)
        .get();
      if (!existingSlug.empty) {
        return res.status(409).json({ error: 'This URL slug is already taken' });
      }
    }

    await bioLinkRef.update({
      name: name.trim(),
      slug,
      description: description || '',
      profilePicture: profilePicture || '',
      themeColor: themeColor || '#06b6d4',
      backgroundStyle: backgroundStyle || 'gradient',
      links: links || [],
      social: social || {},
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Bio link updated successfully' });
  } catch (error) {
    console.error('Error updating bio link:', error);
    res.status(500).json({ error: 'Failed to update bio link' });
  }
});

// ============ DELETE bio link ============
router.delete('/api/bio-links/:id', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const bioLinkRef = db.collection(COLLECTIONS.BIO_LINKS).doc(id);
    const bioLinkDoc = await bioLinkRef.get();

    if (!bioLinkDoc.exists) {
      return res.status(404).json({ error: 'Bio link not found' });
    }

    const bioLinkData = bioLinkDoc.data();
    if (bioLinkData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this bio link' });
    }

    await bioLinkRef.delete();
    res.json({ success: true, message: 'Bio link deleted successfully' });
  } catch (error) {
    console.error('Error deleting bio link:', error);
    res.status(500).json({ error: 'Failed to delete bio link' });
  }
});

// ============ GET user's bio slug ============
router.get('/api/user/bio-slug', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const db = getDatabase();
  if (!db) return res.status(503).json({ error: 'Database not available' });

  try {
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (userDoc.exists && userDoc.data().username) {
      return res.json({ slug: userDoc.data().username });
    }

    const bioLinksSnapshot = await db.collection(COLLECTIONS.BIO_LINKS)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!bioLinksSnapshot.empty) {
      const bioLink = bioLinksSnapshot.docs[0].data();
      return res.json({ slug: bioLink.slug || null });
    }
    res.json({ slug: null });
  } catch (error) {
    console.error('Error fetching bio slug:', error);
    res.json({ slug: null });
  }
});

module.exports = router;
