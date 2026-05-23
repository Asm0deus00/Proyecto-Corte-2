
const firebaseDb = require('../services/firebase.service');
const mysqlDb = require('./db');

const COLLECTION = 'analytics_events';


async function ensureAnalyticsTable() {
  await mysqlDb.query(`
    CREATE TABLE IF NOT EXISTS analytics_log (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      firebase_id     VARCHAR(255) UNIQUE NOT NULL,
      event_type      VARCHAR(100),
      editor_id       INT,
      editor_email    VARCHAR(255),
      payload         JSON,
      event_timestamp DATETIME,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}


async function extractFromFirebase() {
  if (!firebaseDb) throw new Error('Firebase not configured. Add env/serviceAccountKey.json');

  const snapshot = await firebaseDb.collection(COLLECTION).get();
  return snapshot.docs.map(doc => ({ firebase_id: doc.id, ...doc.data() }));
}


function transformEvent(raw) {
  return {
    firebase_id:     raw.firebase_id,
    event_type:      raw.event_type || 'unknown',
    editor_id:       raw.editor?.id || null,
    editor_email:    raw.editor?.email || null,
    payload:         JSON.stringify(raw.payload || {}),
    event_timestamp: raw.timestamp
      ? new Date(raw.timestamp).toISOString().slice(0, 19).replace('T', ' ')
      : null
  };
}


async function loadToMySQL(records) {
  let inserted = 0;
  let skipped = 0;

  for (const rec of records) {
    try {
      const [result] = await mysqlDb.query(
        `INSERT IGNORE INTO analytics_log
         (firebase_id, event_type, editor_id, editor_email, payload, event_timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rec.firebase_id, rec.event_type, rec.editor_id, rec.editor_email, rec.payload, rec.event_timestamp]
      );
      if (result.affectedRows > 0) inserted++;
      else skipped++;
    } catch (err) {
      console.error('[ETL] Failed to insert record:', rec.firebase_id, err.message);
      skipped++;
    }
  }

  return { inserted, skipped };
}


async function runETL() {
  await ensureAnalyticsTable();
  const rawDocs    = await extractFromFirebase();
  const transformed = rawDocs.map(transformEvent);
  const stats      = await loadToMySQL(transformed);
  return { total: rawDocs.length, ...stats };
}

module.exports = { runETL };