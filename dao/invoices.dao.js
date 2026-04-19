const db = require('./db');

// ==================== GET INVOICES ====================
async function getInvoicesByEditor(id_editor) {
  const [rows] = await db.query(
    'SELECT * FROM invoices WHERE id_editor = ? ORDER BY id_invoice DESC',
    [id_editor]
  );
  return rows;
}

// ==================== CREATE INVOICE ====================
async function createInvoice(data) {
  const { id_editor, production_ids } = data;

  if (!Array.isArray(production_ids) || production_ids.length === 0) {
    throw new Error("Debe seleccionar al menos una producción completada");
  }

  let total = 0;
  const validIds = [];

  for (const prodId of production_ids) {
    const [rows] = await db.query(
      `SELECT price FROM productions 
       WHERE id_production = ? AND id_editor = ? AND status = 'completed'`,
      [prodId, id_editor]
    );

    if (rows.length > 0) {
      total += Number(rows[0].price);
      validIds.push(prodId);
    }
  }

  if (validIds.length === 0) {
    throw new Error("Ninguna producción válida para facturar");
  }

  const productionsString = validIds.join(',');
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const [result] = await db.query(
    `INSERT INTO invoices 
     (id_editor, productions_ids, invoice_number, issue_date, subtotal, total, status)
     VALUES (?, ?, ?, CURDATE(), ?, ?, 'draft')`,   // ← CAMBIO AQUÍ: 'draft'
    [id_editor, productionsString, invoiceNumber, total, total]
  );

  return {
    id_invoice: result.insertId,
    invoice_number: invoiceNumber,
    total
  };
}

module.exports = {
  getInvoicesByEditor,
  createInvoice
};