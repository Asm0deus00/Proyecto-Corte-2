
const firebaseDb = require('../services/firebase.service');

const COLLECTION = 'analytics_events';


async function logEvent(eventType, editorId, editorEmail, payload = {}) {
  if (!firebaseDb) return null; // Firebase not configured

  const doc = {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    editor: {
      id: editorId,
      email: editorEmail
    },
    payload,
    session: {
      recorded_at: Date.now()
    }
  };

  const docRef = await firebaseDb.collection(COLLECTION).add(doc);
  return { id: docRef.id, ...doc };
}


async function getAllEvents() {
  if (!firebaseDb) return [];

  const snapshot = await firebaseDb
    .collection(COLLECTION)
    .orderBy('timestamp', 'desc')
    .limit(500)
    .get();

  return snapshot.docs.map(doc => ({ firebase_id: doc.id, ...doc.data() }));
}

module.exports = { logEvent, getAllEvents };