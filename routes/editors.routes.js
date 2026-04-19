const express = require('express');
const router = express.Router();
const db = require('../dao/db');

// LOGIN (simple demo login)
router.post('/login', async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    // Try to find existing editor
    const [rows] = await db.query(
      'SELECT * FROM editors WHERE email = ?',
      [email]
    );

    let editor;

    if (rows.length > 0) {
      editor = rows[0];
    } else {
      // If not exists → create (demo behavior)
      const [result] = await db.query(
        'INSERT INTO editors (email, password, full_name) VALUES (?, ?, ?)',
        [email, password, full_name]
      );

      editor = {
        id_editor: result.insertId,
        email,
        full_name
      };
    }

    res.json({
      success: true,
      editor
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;