const express = require('express');
const router = express.Router();
const invoicesDAO = require('../dao/invoices.dao');

// ==================== GET INVOICES ====================
router.get('/', async (req, res) => {
  try {
    const data = await invoicesDAO.getInvoicesByEditor(req.query.id_editor);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching invoices" });
  }
});

// ==================== CREATE INVOICE ====================
router.post('/', async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔍 debug

    const result = await invoicesDAO.createInvoice(req.body);

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;