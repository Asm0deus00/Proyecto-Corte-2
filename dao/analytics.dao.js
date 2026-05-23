// ============================================================
// Analytics DAO — Firebase Firestore
// Collection: analytics_events
//
// Query Driven Design:
//   Q1: How many invoices are created per day?    → event_type + timestamp
//   Q2: Which editor bills the most?             → editor.id + payload.total
//   Q3: Which production type is most completed? → event_type + payload.video_type
//
// Design decision: EMBEDDED documents (not referenced)
//   - Events are append-only (immutable after creation)
//   - Each query needs the full document, never sub-entities
//   - Firestore bills per document read; embedded = 1 read per query
//   - Acceptable data duplication (editor email) for analytics workloads
// ============================================================

const firebaseDb = require('../services/firebase.service');

const COLLECTION = 'analytics_events';

// ==================== LOG EVENT ====================
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

// ==================== GET ALL EVENTS ====================
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