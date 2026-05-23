const express = require('express');
const router = express.Router();
const editorsDAO = require('../dao/editors.dao');


router.post('/login', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const existing = await editorsDAO.findEditorByEmail(email);

    if (existing) {
      const valid = await editorsDAO.verifyPassword(password, existing.password);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      const { password: _pw, ...safeEditor } = existing;
      return res.json({ success: true, editor: safeEditor });
    }

    const newEditor = await editorsDAO.createEditor(email, password, full_name || 'New Editor');
    res.json({ success: true, editor: newEditor });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


router.put('/:id/tariffs', async (req, res) => {
  try {
    const { tariffs } = req.body;
    const tariffsJson = JSON.stringify(tariffs);
    await require('../dao/db').query(
      'UPDATE editors SET tariffs = ? WHERE id_editor = ?',
      [tariffsJson, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;