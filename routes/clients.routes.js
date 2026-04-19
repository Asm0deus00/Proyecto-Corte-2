const express = require('express');
const router = express.Router();
const clientsDAO = require('../dao/clients.dao');

router.get('/', async (req, res) => {
  const data = await clientsDAO.getClientsByEditor(req.query.id_editor);
  res.json(data);
});

router.post('/', async (req, res) => {
  await clientsDAO.createClient(req.body);
  res.json({ success: true });
});

module.exports = router;