const express = require('express');
const router = express.Router();
const { getDatabase, COLLECTIONS, admin } = require('../../config/firebase.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { generateShortCode, toFirestoreId } = require('../utils/url.utils');

// ============ IMPORT profile / links from external service ============
router.post('/api/import/profile', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { service, data } = req.body;

  if (!service || !data) {
    return res.status(400).json({ error: 'Service name and data are required' });
  }

  const db = getDatabase();

  try {
    let importedCount = 0;

    if (service === 'linktree') {
      // Import Linktree-style links
      if (Array.isArray(data.links)) {
        for (const link of data.links) {
          const shortCode = generateShortCode();
          const linkData = {
            originalUrl: link.url,
            shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            title: link.title || '',
            userId,
            userEmail: req.user.email || '',
            notes: `Imported from ${service}`,
            tags: ['imported'],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          };

          await db.collection(COLLECTIONS.LINKS).add(linkData);
          importedCount++;
        }
      }
    } else if (service === 'bitly') {
      // Import Bitly-style links
      if (Array.isArray(data.links)) {
        for (const link of data.links) {
          const shortCode = link.custom_slug || generateShortCode();
          const linkData = {
            originalUrl: link.long_url,
            shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            title: link.title || '',
            userId,
            userEmail: req.user.email || '',
            notes: `Imported from ${service} (${link.link_id || ''})`,
            tags: ['imported'],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          };

          await db.collection(COLLECTIONS.LINKS).add(linkData);
          importedCount++;
        }
      }
    } else if (service === 'rebrandly') {
      if (Array.isArray(data.links)) {
        for (const link of data.links) {
          const shortCode = link.slashtag || generateShortCode();
          const linkData = {
            originalUrl: link.destination,
            shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            title: link.title || '',
            userId,
            userEmail: req.user.email || '',
            notes: `Imported from ${service} (${link.id || ''})`,
            tags: ['imported'],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          };

          await db.collection(COLLECTIONS.LINKS).add(linkData);
          importedCount++;
        }
      }
    } else {
      return res.status(400).json({ error: `Unsupported service: ${service}` });
    }

    res.json({ success: true, importedCount, message: `Successfully imported ${importedCount} links from ${service}` });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;
