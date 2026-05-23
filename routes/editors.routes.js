const express = require('express');
const router = express.Router();
const editorsDAO = require('../dao/editors.dao');

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const existing = await editorsDAO.findEditorByEmail(email);

    if (existing) {
      // Verify password against stored hash
      const valid = await editorsDAO.verifyPassword(password, existing.password);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      // Return editor without password field
      const { password: _pw, ...safeEditor } = existing;
      return res.json({ success: true, editor: safeEditor });
    }

    // Auto-register: first time user logs in with an unknown email
    const newEditor = await editorsDAO.createEditor(email, password, full_name || 'New Editor');
    res.json({ success: true, editor: newEditor });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== UPDATE TARIFFS ====================
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