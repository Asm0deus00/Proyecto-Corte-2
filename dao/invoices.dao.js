const db = require('./db');

const InvoicesDAO = {
  create: async (invoice) => {
    const [result] = await db.execute(
      'INSERT INTO invoices (id_editor, id_client, invoice_number, issue_date, production_details, subtotal, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [invoice.id_editor, invoice.id_client, invoice.invoice_number, invoice.issue_date, invoice.production_details, invoice.subtotal, invoice.total, invoice.status || 'draft']
    );
    return result.insertId;
  },
  findByEditor: async (id_editor) => {
    const [rows] = await db.execute('SELECT * FROM invoices WHERE id_editor = ?', [id_editor]);
    return rows;
  }
};

module.exports = InvoicesDAO;