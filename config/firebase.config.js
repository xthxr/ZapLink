const admin = require('firebase-admin');
require('dotenv').config();

/** @type {admin.firestore.Firestore | null} */
let db = null;

/** @type {admin.auth.Auth | null} */
let auth = null;

/** @type {{ enabled: boolean, mode: string, reason: string }} */
const firebaseState = {
  enabled: false,
  mode: 'memory',
  reason: 'Firebase not initialized'
};

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * @returns {boolean} True if initialized successfully
 */
function initializeFirebase() {
  if (isInitialized) {
    return true;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });

    db = admin.firestore();
    auth = admin.auth();
    firebaseState.enabled = true;
    firebaseState.mode = 'firestore';
    firebaseState.reason = 'Firebase connected successfully';
    isInitialized = true;

    console.log('✅ Firebase Admin initialized');
    return true;
  } catch (error) {
    console.log('⚠️ Firebase Admin not configured. Using in-memory storage.');
    console.log('   See docs/FIREBASE_SETUP.md for setup instructions.');
    return false;
  }
}

/**
 * Get Firestore database instance
 * @returns {admin.firestore.Firestore | null}
 */
function getDatabase() {
  return db;
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth | null}
 */
function getAuth() {
  return auth;
}

/**
 * Get current Firebase state
 * @returns {{ enabled: boolean, mode: string, reason: string }}
 */
function getFirebaseState() {
  return firebaseState;
}

/**
 * Firestore collection names
 */
const COLLECTIONS = {
  LINKS: 'links',
  ANALYTICS: 'analytics',
  USERS: 'users',
  BIO_LINKS: 'bioLinks'
};

module.exports = {
  initializeFirebase,
  getDatabase,
  getAuth,
  getFirebaseState,
  admin,
  COLLECTIONS
};
