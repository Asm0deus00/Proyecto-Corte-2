const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ============================================================
// Firebase Admin SDK initialization
// The serviceAccountKey.json must be placed in env/ folder.
// It is excluded from version control via .gitignore.
// To obtain it: Firebase Console → Project Settings → Service Accounts → Generate new private key
// ============================================================

const keyPath = path.join(__dirname, '../env/serviceAccountKey.json');

// Guard: if key file is missing (e.g. in CI), export a mock so the
// rest of the app doesn't crash on startup.
if (!fs.existsSync(keyPath)) {
  console.warn('[Firebase] serviceAccountKey.json not found. Firebase features will be disabled.');
  module.exports = null;
} else {
  const serviceAccount = require(keyPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  module.exports = db;
}