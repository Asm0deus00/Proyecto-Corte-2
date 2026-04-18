const db = require('./db');

const ClientsDAO = {
  create: async (client) => {
    const [result] = await db.execute(
      'INSERT INTO clients (id_editor, name, email, nit, address) VALUES (?, ?, ?, ?, ?)',
      [client.id_editor, client.name, client.email || null, client.nit || null, client.address || null]
    );
    return result.insertId;
  },
  findByEditor: async (id_editor) => {
    const [rows] = await db.execute('SELECT * FROM clients WHERE id_editor = ? ORDER BY name', [id_editor]);
    return rows;
  }
};

module.exports = ClientsDAO;