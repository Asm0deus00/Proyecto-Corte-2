const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');


const keyPath = path.join(__dirname, '../env/serviceAccountKey.json');

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