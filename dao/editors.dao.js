const db = require('./db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// ==================== FIND BY EMAIL ====================
async function findEditorByEmail(email) {
  const [rows] = await db.query(
    'SELECT * FROM editors WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

// ==================== CREATE EDITOR (with hashed password) ====================
async function createEditor(email, plainPassword, full_name) {
  // Hash the password with bcrypt (salt is automatically generated and embedded)
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const [result] = await db.query(
    'INSERT INTO editors (email, password, full_name) VALUES (?, ?, ?)',
    [email, hashedPassword, full_name]
  );
  return { id_editor: result.insertId, email, full_name };
}

// ==================== VERIFY PASSWORD ====================
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  findEditorByEmail,
  createEditor,
  verifyPassword
};