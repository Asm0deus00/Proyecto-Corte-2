const db = require('./db');

const EditorsDAO = {
  create: async (editor) => {
    const [result] = await db.execute(
      'INSERT INTO editors (full_name, email, password) VALUES (?, ?, ?)',
      [editor.full_name, editor.email, editor.password]
    );
    return result.insertId;
  },
  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM editors WHERE email = ?', [email]);
    return rows[0];
  }
};

module.exports = EditorsDAO;