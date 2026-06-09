const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Project config & services
// ---------------------------------------------------------------------------
const { initializeFirebase, getFirebaseState } = require('./config/firebase.config');
const env = require('./config/env');

const { securityHeaders, apiLimiter } = require('./src/middleware/security.middleware');
const errorHandler = require('./src/middleware/error.middleware');
const { attachFirebaseState } = require('./src/middleware/firebase.middleware');

// ---------------------------------------------------------------------------
// Initialize Firebase
// ---------------------------------------------------------------------------
initializeFirebase();

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();
const server = env.isServerless ? null : http.createServer(app);

const io = env.isServerless
  ? { emit: () => {} }
  : socketIo(server, {
      cors: {
        origin: env.ALLOWED_ORIGIN || false,
        methods: ['GET', 'POST']
      }
    });

// Make io accessible to route handlers via app.settings
app.set('socketio', io);

// ---------------------------------------------------------------------------
// Global middleware (order matters)
// ---------------------------------------------------------------------------
app.use(securityHeaders);
app.use(apiLimiter);
app.use(cors({
  origin: env.ALLOWED_ORIGIN || false,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public', { index: false }));
app.use(attachFirebaseState);

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/', require('./src/routes/index'));
app.use('/', require('./src/routes/links'));
app.use('/', require('./src/routes/analytics'));
app.use('/', require('./src/routes/bio'));
app.use('/', require('./src/routes/profile'));
app.use('/', require('./src/routes/split-test'));
app.use('/', require('./src/routes/bug-report'));
app.use('/', require('./src/routes/import'));
app.use('/', require('./src/routes/admin'));

// ---------------------------------------------------------------------------
// Static SPA page routes (exact path matches — must be before catch-all)
// ---------------------------------------------------------------------------
app.use('/', require('./src/routes/pages'));

// ---------------------------------------------------------------------------
// Tracking & redirect router (catch-all routes — register LAST)
// ---------------------------------------------------------------------------
const { createTrackingRouter } = require('./src/routes/tracking');
const trackingRouter = createTrackingRouter({ io });
app.use('/', trackingRouter);

// ---------------------------------------------------------------------------
// Error handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Socket.IO + server start
// ---------------------------------------------------------------------------
if (!env.isServerless) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', (shortCode) => {
      console.log(`Client ${socket.id} subscribed to ${shortCode}`);
      socket.join(`analytics:${shortCode}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // 24-hour pre-expiry notification check (runs every hour)
  const { getDatabase, COLLECTIONS } = require('./config/firebase.config');
  // const memoryStore = require('./src/services/memory.service');

  setInterval(async () => {
    const db = getDatabase();
    if (!db) return;

    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const snapshot = await db.collection(COLLECTIONS.LINKS)
        .where('isActive', '==', true)
        .where('notifiedExpiry', '==', false)
        .get();

      for (const doc of snapshot.docs) {
        const link = doc.data();
        if (link.expiresAt && link.expiresAt.toDate) {
          const expiry = link.expiresAt.toDate();
          if (expiry <= in24h && expiry > now) {
            console.log(`⏰ Link expiring soon: ${link.shortCode} (${link.userEmail})`);
            await doc.ref.update({ notifiedExpiry: true });
            // TODO: plug in Nodemailer here to email link.userEmail
          }
        }
      }
    } catch (err) {
      console.error('Expiry notification check error:', err);
    }
  }, 60 * 60 * 1000);

  const PORT = env.PORT;
  server.listen(PORT, () => {
    console.log(`🚀 piik.me server running on http://localhost:${PORT}`);
    const fbState = getFirebaseState();
    console.log(`📊 Firebase: ${fbState.enabled ? '✅ enabled' : '⚠️ ' + fbState.reason} (mode: ${fbState.mode})`);
  });
}

module.exports = app;
