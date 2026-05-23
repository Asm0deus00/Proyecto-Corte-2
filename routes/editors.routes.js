const express = require('express');
const router = express.Router();
const editorsDAO = require('../dao/editors.dao');

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const editor = await resolveEditor(email, password, full_name);
    res.json({ success: true, editor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ==================== RESOLVE EDITOR (find or create) ====================
async function resolveEditor(email, password, full_name) {
  const existing = await editorsDAO.findEditorByEmail(email);
  if (existing) return existing;
  return editorsDAO.createEditor(email, password, full_name);
}

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