const db = require('./db');

async function findEditorByEmail(email) {
  const [rows] = await db.query(
    'SELECT * FROM editors WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function createEditor(email, password, full_name) {
  const [result] = await db.query(
    'INSERT INTO editors (email, password, full_name) VALUES (?, ?, ?)',
    [email, password, full_name]
  );
  return { id_editor: result.insertId, email, full_name };
}

module.exports = {
  findEditorByEmail,
  createEditor
};