const express = require('express');
const router = express.Router();
const db = require('../services/mysql.service');

router.get('/', async (req, res) => {
  const { id_editor } = req.query;

  const [rows] = await db.query(
    'SELECT * FROM productions WHERE id_editor = ?',
    [id_editor]
  );

  res.json(rows);
});

router.post('/', async (req, res) => {
  const { id_editor, id_client, title, video_type, duration, price, status } = req.body;

  await db.query(
    `INSERT INTO productions 
     (id_editor, id_client, title, video_type, duration, price, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_editor, id_client, title, video_type, duration, price, status]
  );

  res.json({ success: true });
});

module.exports = router;