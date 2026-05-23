const express = require('express');
const router = express.Router();
const { runETL } = require('../dao/etl.dao');

// ==================== RUN ETL ====================
// POST /api/etl/run
// Triggered by the "Run ETL" button in the frontend dashboard
router.post('/run', async (req, res) => {
  try {
    console.log('[ETL] Process started...');
    const result = await runETL();
    console.log(`[ETL] Done — total: ${result.total}, inserted: ${result.inserted}, skipped: ${result.skipped}`);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[ETL] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;