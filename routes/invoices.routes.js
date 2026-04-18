const express = require('express');
const router = express.Router();
const InvoicesDAO = require('../dao/invoices.dao');

// Obtener todas las facturas de un editor
router.get('/', async (req, res) => {
  try {
    const invoices = await InvoicesDAO.findByEditor(req.query.id_editor || 1);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva factura
router.post('/', async (req, res) => {
  try {
    const id = await InvoicesDAO.create(req.body);
    res.status(201).json({ id, message: 'Factura creada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;