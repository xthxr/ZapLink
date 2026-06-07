/**
 * Script to set verified badges for the first 100 active bio links
 * Run this script once to mark the first 100 users as verified
 * 
 * Usage:
 * 1. Make sure you have Firebase Admin SDK set up
 * 2. Run: node scripts/set-verified-badges.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// You need to download your service account key from Firebase Console
// and save it as firebase-admin-key.json in the root directory
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setVerifiedBadges() {
  try {
    console.log('Fetching all active bio links ordered by creation date...');
    
    // Get all active bio links ordered by createdAt

    const snapshot = await db.collection('bioLinks')
      .where('isActive', '==', true)
      .orderBy('createdAt', 'asc')
      .limit(100)
      .get();

    console.log(`Found ${snapshot.size} active bio links`);

    if (snapshot.empty) {
      console.log('No bio links found');
      return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      batch.update(doc.ref, { verified: true });
      count++;
      console.log(`${count}. Marking ${doc.data().slug} as verified`);
    });

    await batch.commit();
    console.log(`\n✅ Successfully set verified badges for ${count} bio links`);
    
  } catch (error) {
    console.error('Error setting verified badges:', error);
  } finally {
    process.exit();
  }
}

// Run the script

setVerifiedBadges();
