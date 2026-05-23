const express = require('express');
const router = express.Router();
const analyticsDAO = require('../dao/analytics.dao');


router.post('/event', async (req, res) => {
  try {
    const { event_type, editor_id, editor_email, payload } = req.body;
    const result = await analyticsDAO.logEvent(event_type, editor_id, editor_email, payload || {});
    res.json({ success: true, id: result?.id || null });
  } catch (err) {
    console.error('[Analytics] logEvent error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/events', async (req, res) => {
  try {
    const events = await analyticsDAO.getAllEvents();
    res.json(events);
  } catch (err) {
    console.error('[Analytics] getEvents error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;