const express = require('express');
const router = express.Router();
const { getDatabase, admin } = require('../../config/firebase.config');

// ============ SUBMIT bug report ============
router.post('/api/bug-report', async (req, res) => {
  const { name, email, subject, message, type } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    const db = getDatabase();
    if (!db) {
      console.log('Bug report logged (Firestore unavailable):', { name, email, subject });
      return res.json({ success: true, message: 'Bug report received (logged locally)' });
    }

    const bugReport = {
      name: name.trim(),
      email: email.trim(),
      subject: subject || 'No subject',
      message: message.trim(),
      type: type || 'general',
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('bugReports').add(bugReport);
    res.json({ success: true, message: 'Bug report submitted successfully' });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    res.status(500).json({ error: 'Failed to submit bug report' });
  }
});

module.exports = router;
