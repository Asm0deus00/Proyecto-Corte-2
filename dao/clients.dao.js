const db = require('./db');

async function getClientsByEditor(id_editor) {
  const [rows] = await db.query(
    'SELECT * FROM clients WHERE id_editor = ?',
    [id_editor]
  );
  return rows;
}

async function createClient(client) {
  const { id_editor, name, email } = client;

  await db.query(
    'INSERT INTO clients (id_editor, name, email) VALUES (?, ?, ?)',
    [id_editor, name, email]
  );
}

module.exports = {
  getClientsByEditor,
  createClient
};