const db = require('./db');

// ==================== GET INVOICES ====================
async function getInvoicesByEditor(id_editor) {
  const [rows] = await db.query(
    'SELECT * FROM invoices WHERE id_editor = ?',
    [id_editor]
  );

  return rows;
}

// ==================== CREATE INVOICE ====================
async function createInvoice(data) {
  const { id_editor, production_ids } = data;

  // ✅ Validate array
  if (!Array.isArray(production_ids) || production_ids.length === 0) {
    throw new Error("Invalid production IDs");
  }

  let total = 0;

  // ✅ Calculate total
  for (const id of production_ids) {
    const [rows] = await db.query(
      'SELECT price FROM productions WHERE id_production = ? AND id_editor = ? AND status = "completed"',
      [id, id_editor]
    );

    if (!rows.length) continue;

    total += Number(rows[0].price);
  }

  // ✅ Convert array → string ONLY for storage
  const productions_ids_string = production_ids.join(',');

  // ✅ Insert invoice
  const [result] = await db.query(
    'INSERT INTO invoices (id_editor, productions_ids, total) VALUES (?, ?, ?)',
    [id_editor, productions_ids_string, total]
  );

  return {
    id_invoice: result.insertId,
    total
  };
}

module.exports = {
  getInvoicesByEditor,
  createInvoice
};