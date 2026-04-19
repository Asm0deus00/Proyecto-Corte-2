const express = require('express');
const router = express.Router();
const productionsDAO = require('../dao/productions.dao');
const db = require('../dao/db');

// ==================== GET PRODUCTIONS ====================
router.get('/', async (req, res) => {
  try {
    const data = await productionsDAO.getProductionsByEditor(req.query.id_editor);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching productions" });
  }
});

// ==================== CREATE PRODUCTION ====================
router.post('/', async (req, res) => {
  try {
    await productionsDAO.createProduction(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating production" });
  }
});

// ==================== DELETE PRODUCTION ====================
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM productions WHERE id_production = ?',
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting production" });
  }
});
// ==================== UPDATE PRODUCTION STATUS ====================
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      `UPDATE productions 
       SET status = ?
       WHERE id_production = ?`,
      [status, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating status" });
  }
});
module.exports = router;