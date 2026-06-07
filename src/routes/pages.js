const express = require('express');
const path = require('path');
const { getDatabase, COLLECTIONS } = require('../../config/firebase.config');

const router = express.Router();

// Landing page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'landing.html'));
});

// Client-side SPA routes — all serve index.html (the SPA app shell)
router.get(['/home', '/analytics', '/profile', '/qr-generator', '/bio-link', '/dashboard', '/login', '/signup', '/terms', '/privacy', '/forgot-password', '/reset-password', '/pricing', '/features', '/docs'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

// Expired link page
router.get('/expired', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'expired.html'));
});

module.exports = router;
