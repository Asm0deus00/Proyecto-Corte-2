const express = require('express');
const router = express.Router();
const ClientsDAO = require('../dao/clients.dao');

// Obtener todos los clientes de un editor
router.get('/', async (req, res) => {
  try {
    const clients = await ClientsDAO.findByEditor(req.query.id_editor || 1); // por ahora usamos id_editor = 1
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const id = await ClientsDAO.create(req.body);
    res.status(201).json({ id, message: 'Cliente creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;